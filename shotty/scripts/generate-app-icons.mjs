/**
 * ホーム画面用アプリアイコンを書き出す。
 * 使い方: node scripts/generate-app-icons.mjs
 *
 * 元画像: public/icons/app-icon-source.png
 * 角の透明部分はダークグリーン (#0a160a) で塗りつぶす。
 * maskable 版はセーフゾーン（中央 80%）に収める。
 */
import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../public/icons')
const SRC = path.join(OUT, 'app-icon-source.png')
const BG = '#0a160a'

if (!fs.existsSync(SRC)) {
  console.error('missing source:', SRC)
  process.exit(1)
}

const TARGETS = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
]

const browser = await chromium.launch({ headless: true })
const srcData = fs.readFileSync(SRC).toString('base64')
const srcUrl = `data:image/png;base64,${srcData}`

for (const t of TARGETS) {
  const page = await browser.newPage({
    viewport: { width: t.size, height: t.size },
    deviceScaleFactor: 1,
  })
  const scale = t.maskable ? 0.8 : 1
  const pad = ((1 - scale) / 2) * 100
  await page.setContent(
    `<html><head><style>
      html,body{margin:0;padding:0;width:100%;height:100%;background:${BG};overflow:hidden;}
      img{display:block;position:absolute;left:${pad}%;top:${pad}%;width:${scale * 100}%;height:${scale * 100}%;object-fit:contain;}
    </style></head><body><img src="${srcUrl}" alt=""/></body></html>`,
    { waitUntil: 'load' }
  )
  await page.waitForTimeout(150)
  const file = path.join(OUT, t.file)
  await page.screenshot({ path: file, omitBackground: false, type: 'png' })
  console.log('wrote', file, `${t.size}x${t.size}`, t.maskable ? '(maskable)' : '')
  await page.close()
}

await browser.close()
console.log('done')

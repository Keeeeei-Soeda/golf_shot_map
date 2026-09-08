/**
 * アイコン4組み合わせを Playwright で撮影する。
 * 使い方: node scripts/screenshot-icon-combos.mjs
 */
import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SHOTTY_BASE || 'http://localhost:3001'
const OUT = path.join(__dirname, '../tmp/icon-combos')

const COMBOS = [
  { id: 'A', t: 1, p: 3 },
  { id: 'B', t: 1, p: 4 },
  { id: 'C', t: 2, p: 3 },
  { id: 'D', t: 2, p: 4 },
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
})

fs.mkdirSync(OUT, { recursive: true })
await page.goto(`${BASE}/icon-compare.html`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

const allPath = path.join(OUT, 'all-4-combos.png')
await page.screenshot({ path: allPath, fullPage: true })
console.log('wrote', allPath)

for (const c of COMBOS) {
  const stage = page.locator(`[data-combo-stage="${c.id}"]`)
  const file = path.join(OUT, `combo-${c.id}-t${c.t}-p${c.p}-c5.png`)
  await stage.screenshot({ path: file })
  console.log('wrote', file)
}

await browser.close()
console.log('done')

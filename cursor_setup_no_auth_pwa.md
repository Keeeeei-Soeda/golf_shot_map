# Cursor 実装指示書 — Shotty Next.js版（ログインなし・PWA対応）

> 現行: vanilla JS (GitHub Pages / golf_shot_map)
> 移行先: Next.js 14 + PWA + localStorage
> デプロイ: ConoHa VPS + Nginx + pm2 + GitHub Actions
> ドメイン: shotty.net
> ブランドカラー: オレンジ #f97316 / グリーン #2ecc71 / ベース #0d1f0d

---

## ⚠️ 最重要：GitHubを常に正とすること

```
この指示書は作成時点のスナップショットです。
実際のコードはGitHubの最新状態と異なる可能性があります。
```

### 作業前に必ず行うこと

**作業開始前に必ずGitHubの最新ファイルを確認すること。**

```
リポジトリ: github.com/Keeeeei-Soeda/golf_shot_map
ブランチ:   main
```

確認すべきファイル：

```
index.html        ← UI構成・パネル構造
style.css         ← CSSクラス名・変数名
app/core.js       ← 状態管理・データ構造
app/shot.js       ← ショット記録ロジック
app/map.js        ← 地図・ヤード表示
app/measure.js    ← 測定モード
app/sidebar.js    ← メニュー・ホール選択
app/clubs.js      ← クラブ管理
app/history.js    ← ラウンド履歴
courses.js        ← コースデータ（ルート直下）
```

### 差異があった場合のルール

| 項目 | 優先度 |
|---|---|
| GitHubの最新ファイル | **最優先（正）** |
| この指示書の内容 | 参考・方針のみ |

- **関数名・変数名・データ構造** → GitHubのコードを使うこと
- **CSSクラス名** → GitHubの `style.css` を使うこと
- **コースデータ** → GitHubの `courses.js` をそのまま移植
- **localStorage のキー名** → GitHubのコードから確認して合わせること

### 差異が見つかった場合

作業中に指示書とGitHubのコードに差異を発見した場合：

1. **GitHubのコードを優先して実装を進める**
2. 差異の内容をメモしておく
3. **全作業完了後にまとめて報告する**

作業途中で都度確認を求めない。完了後に一括報告すること。

---

## この指示書の方針

- ログイン・DB・Stripe は**今回やらない**（後から追加できる構成にする）
- データは引き続き **localStorage** で管理
- 現行の全機能をそのまま移植する
- PWA対応（ホーム画面追加・オフライン動作）
- ブランドを Shotty に刷新（カラー・ロゴ）
- pm2 + GitHub Actions で自動デプロイ

---

## Step 1: Next.js プロジェクト作成

```bash
npx create-next-app@14 shotty \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd shotty
```

対話形式の質問への回答：
- TypeScript → **Yes**
- ESLint → **Yes**
- Tailwind CSS → **Yes**
- `src/` directory → **Yes**
- App Router → **Yes**
- import alias → **Yes**（`@/*`）

---

## Step 2: 追加パッケージのインストール

```bash
npm install @vis.gl/react-google-maps
npm install next-pwa
npm install clsx
```

---

## Step 3: ディレクトリ構成

以下の構成を作成してください：

```
shotty/
├── src/
│   ├── app/
│   │   ├── globals.css          # グローバルCSS（CSSカスタムプロパティ定義）
│   │   ├── layout.tsx           # ルートレイアウト（PWAメタタグ含む）
│   │   └── page.tsx             # メイン画面（地図・ショット記録）
│   ├── components/
│   │   ├── map/
│   │   │   ├── GolfMap.tsx      # Google Maps本体
│   │   │   ├── ShotPanel.tsx    # ショット登録パネル
│   │   │   ├── CupPanel.tsx     # カップインパネル
│   │   │   ├── HoleSummary.tsx  # ホールサマリー
│   │   │   ├── ReviewPanel.tsx  # ショット履歴パネル
│   │   │   └── YardageBar.tsx   # F/C/Bヤード表示
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx      # ハンバーガーメニュー
│   │   │   ├── HoleStrip.tsx    # ホール選択ストリップ
│   │   │   └── ClubEditor.tsx   # クラブセット編集
│   │   ├── scorecard/
│   │   │   └── ScoreCard.tsx    # スコアカード
│   │   ├── history/
│   │   │   └── HistoryPanel.tsx # ラウンド履歴
│   │   └── layout/
│   │       └── Header.tsx       # ヘッダー（ロゴ・GPS・履歴ボタン）
│   ├── hooks/
│   │   ├── useRound.ts          # ラウンドデータ管理（localStorage）
│   │   ├── useClubs.ts          # クラブセット管理（localStorage）
│   │   └── useGPS.ts            # GPS位置情報
│   ├── lib/
│   │   └── geo.ts               # haversine距離計算・bearing計算
│   ├── types/
│   │   └── index.ts             # 型定義
│   └── data/
│       └── courses.ts           # コースデータ（courses.jsから移植）
├── public/
│   ├── manifest.json            # PWAマニフェスト
│   └── icons/
│       ├── icon-192.png         # PWAアイコン192px
│       └── icon-512.png         # PWAアイコン512px
├── .env.local                   # 環境変数
├── next.config.js               # Next.js設定（PWA含む）
├── ecosystem.config.js          # pm2設定
└── .github/
    └── workflows/
        └── deploy.yml           # GitHub Actions自動デプロイ
```

---

## Step 4: 環境変数

`.env.local` を作成：

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=現行と同じAPIキーを入力
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=c041c97b58243474e5cf18cb
```

`.env.example` を作成（GitにpushするOK）：

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=c041c97b58243474e5cf18cb
```

`.gitignore` に追加：

```
.env.local
```

---

## Step 5: 型定義

`src/types/index.ts` を作成：

```typescript
export interface HoleData {
  no: number
  par: number
  yards: { back: number; reg: number; ladies: number }
  tee: { lat: number; lng: number }
  front: { lat: number; lng: number }
  center: { lat: number; lng: number }
  back: { lat: number; lng: number }
}

export interface CourseData {
  name: string
  cid: number
  holes: HoleData[]
}

export interface GolfCourse {
  name: string
  pref: string
  gcid: number
  lat: number
  lng: number
  courses: CourseData[]
}

export interface ShotRecord {
  no: number
  lat: number
  lng: number
  club: string
  carry: number
  remaining: number
  fromLabel: string
  evaluation: string[]  // ['nice','miss','duff','slice','hook']
}

export interface HoleMeta {
  cupIn: boolean
  scoreDiff: number
  par: number
  totalShots: number
  putts: number | null
  penaltyFrom: number | null
}

export interface RoundShots {
  [key: string]: ShotRecord[] | HoleMeta
}

export interface RoundRecord {
  id: string
  date: string
  gcName: string
  courseName: string
  shots: RoundShots
  updatedAt: number
}

export interface AppState {
  gcIdx: number | null
  cIdx: number | null
  hIdx: number
}

export const SCORE_DEFS = [
  { diff: -2, name: 'イーグル',     cls: 'eagle'  },
  { diff: -1, name: 'バーディ',     cls: 'birdie' },
  { diff:  0, name: 'パー',         cls: 'par'    },
  { diff:  1, name: 'ボギー',       cls: 'bogey'  },
  { diff:  2, name: 'ダブルボギー', cls: 'dbl'    },
  { diff:  3, name: 'トリプルボギー', cls: 'tpl'  },
] as const

export const EVAL_TAGS = [
  { key: 'nice',  label: '👍 ナイス'  },
  { key: 'miss',  label: '😤 ミス'    },
  { key: 'duff',  label: '⛏ ダフり'  },
  { key: 'slice', label: '↗ スライス' },
  { key: 'hook',  label: '↙ フック'   },
] as const

export const CLUB_PRESETS: Record<string, string[]> = {
  'ドライバー':        ['1W'],
  'フェアウェイウッド': ['3W', '5W'],
  'ユーティリティ':    ['4UT', '5UT'],
  'アイアン':          ['3I','4I','5I','6I','7I','8I','9I'],
  'ウェッジ':          ['SW','PW','AW','50°','52°','54°','55°','56°','57°','58°','60°'],
  'パター':            ['PT'],
}

export const CLUB_ORDER = [
  '1W','3W','5W','4UT','5UT',
  '3I','4I','5I','6I','7I','8I','9I',
  'SW','PW','AW','50°','52°','54°','55°','56°','57°','58°','60°','PT',
]
```

---

## Step 6: geo.ts（距離計算）

`src/lib/geo.ts` を作成（現行 core.js の haversine / calcBearing をそのまま移植）：

```typescript
export function haversine(
  la1: number, lo1: number,
  la2: number, lo2: number
): number {
  const R = 6371000
  const r = Math.PI / 180
  const dL = (la2 - la1) * r
  const dN = (lo2 - lo1) * r
  const a =
    Math.sin(dL / 2) ** 2 +
    Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dN / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function haversineYards(
  la1: number, lo1: number,
  la2: number, lo2: number
): number {
  return Math.round(haversine(la1, lo1, la2, lo2) * 1.09361)
}

export function calcBearing(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const r = Math.PI / 180
  const dLng = (lng2 - lng1) * r
  const y = Math.sin(dLng) * Math.cos(lat2 * r)
  const x =
    Math.cos(lat1 * r) * Math.sin(lat2 * r) -
    Math.sin(lat1 * r) * Math.cos(lat2 * r) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

export function scoreDef(diff: number) {
  const SCORE_DEFS = [
    { diff: -2, name: 'イーグル',     cls: 'eagle'  },
    { diff: -1, name: 'バーディ',     cls: 'birdie' },
    { diff:  0, name: 'パー',         cls: 'par'    },
    { diff:  1, name: 'ボギー',       cls: 'bogey'  },
    { diff:  2, name: 'ダブルボギー', cls: 'dbl'    },
    { diff:  3, name: 'トリプルボギー', cls: 'tpl'  },
  ]
  return SCORE_DEFS.find(d => d.diff === diff) ?? { diff, name: `+${diff}`, cls: 'other' }
}
```

---

## Step 7: courses.ts（コースデータ移植）

`src/data/courses.ts` を作成し、現行の `courses.js` の `COURSES` 配列を以下の形でそのまま貼り付ける：

```typescript
import type { GolfCourse } from '@/types'

export const COURSES: GolfCourse[] = [
  // ここに courses.js の COURSES 配列の中身をそのまま貼り付ける
  // const COURSES = [ ... ] の中身だけ貼り付けること
]
```

---

## Step 8: localStorage フック

`src/hooks/useRound.ts` を作成：

```typescript
'use client'
import { useState, useCallback } from 'react'
import type { RoundRecord, RoundShots } from '@/types'

const MAX_ROUNDS = 30

export function useRound() {
  const [roundShots, setRoundShots] = useState<RoundShots>({})
  const [roundId, setRoundId] = useState<string | null>(null)

  const startRound = useCallback((gcName: string, courseName: string) => {
    const id = `round_${Date.now()}`
    setRoundId(id)
    setRoundShots({})
    return id
  }, [])

  const saveRound = useCallback((
    id: string,
    gcName: string,
    courseName: string,
    shots: RoundShots
  ) => {
    if (!id) return
    const all: RoundRecord[] = JSON.parse(
      localStorage.getItem('golfRounds') ?? '[]'
    )
    const idx = all.findIndex(r => r.id === id)
    const data: RoundRecord = {
      id,
      date: new Date().toLocaleDateString('ja-JP'),
      gcName,
      courseName,
      shots,
      updatedAt: Date.now(),
    }
    if (idx >= 0) all[idx] = data
    else all.unshift(data)
    localStorage.setItem('golfRounds', JSON.stringify(all.slice(0, MAX_ROUNDS)))
  }, [])

  const loadRound = useCallback((id: string) => {
    const all: RoundRecord[] = JSON.parse(
      localStorage.getItem('golfRounds') ?? '[]'
    )
    const r = all.find(x => x.id === id)
    if (r) {
      setRoundId(r.id)
      setRoundShots(r.shots)
    }
    return r ?? null
  }, [])

  const getAllRounds = useCallback((): RoundRecord[] => {
    return JSON.parse(localStorage.getItem('golfRounds') ?? '[]')
  }, [])

  const clearAllRounds = useCallback(() => {
    localStorage.removeItem('golfRounds')
  }, [])

  return {
    roundShots,
    setRoundShots,
    roundId,
    startRound,
    saveRound,
    loadRound,
    getAllRounds,
    clearAllRounds,
  }
}
```

`src/hooks/useClubs.ts` を作成：

```typescript
'use client'
import { useState } from 'react'
import { CLUB_ORDER } from '@/types'

const DEFAULT_CLUBS = ['1W','UT','7I','8I','9I','56°','PW','SW','PT','','','','','']

function sortClubs(arr: string[]): string[] {
  const filled = arr.filter(c => c !== '')
  filled.sort((a, b) => {
    const ia = CLUB_ORDER.indexOf(a)
    const ib = CLUB_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return 0
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  return Array.from({ length: 14 }, (_, i) => filled[i] ?? '')
}

export function useClubs() {
  const [clubs, setClubs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [...DEFAULT_CLUBS]
    try {
      const saved = localStorage.getItem('golfClubSet')
      if (saved) {
        const arr = JSON.parse(saved)
        return sortClubs(Array.from({ length: 14 }, (_, i) => arr[i] ?? ''))
      }
    } catch {}
    return [...DEFAULT_CLUBS]
  })

  const saveClubs = (arr: string[]) => {
    const sorted = sortClubs(arr)
    setClubs(sorted)
    localStorage.setItem('golfClubSet', JSON.stringify(sorted))
  }

  return { clubs, saveClubs, sortClubs }
}
```

---

## Step 9: グローバルCSS（ブランドカラー適用）

`src/app/globals.css` を以下に置き換え：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* ===== Shotty ブランドカラー ===== */
  --color-base:         #0d1f0d;
  --color-base-deep:    #0a160a;
  --color-base-mid:     #162816;
  --color-base-light:   #1e3a1e;
  --color-fairway:      #1a5c1a;
  --color-border-dark:  #2a4a2a;
  --color-border-mid:   #2d4f2d;

  /* アクセント */
  --color-orange:       #f97316;
  --color-orange-dim:   rgba(249, 115, 22, 0.15);
  --color-green:        #2ecc71;
  --color-green-dim:    rgba(46, 204, 113, 0.12);
  --color-gold:         #fbbf24;

  /* テキスト（ダーク画面） */
  --color-text-dark:    #eef4ee;
  --color-muted-dark:   #7a9a7a;

  /* ライト画面 */
  --color-white-bg:     #fafaf8;
  --color-white-card:   #ffffff;
  --color-white-border: #e8e8e4;
  --color-text-light:   #1a1a18;
  --color-muted-light:  #9a9a94;

  /* スコアカラー */
  --color-eagle-bg:   #fde68a;
  --color-eagle-text: #92400e;
  --color-birdie-bg:  #bfdbfe;
  --color-birdie-text:#1e40af;
  --color-par-bg:     #bbf7d0;
  --color-par-text:   #14532d;
  --color-bogey-bg:   #fed7aa;
  --color-bogey-text: #9a3412;
  --color-dbl-bg:     #fecaca;
  --color-dbl-text:   #991b1b;
  --color-tpl-bg:     #fca5a5;
  --color-tpl-text:   #7f1d1d;

  /* レガシー変数（移植コードとの互換性） */
  --gd: var(--color-base);
  --g1: var(--color-base-mid);
  --g2: var(--color-base-light);
  --g3: var(--color-border-mid);
  --g4: #3d6b3d;
  --gv: var(--color-green);
  --w:  var(--color-text-dark);
  --gr: var(--color-muted-dark);
  --acc: var(--color-gold);
  --red: #e05252;
  --blue: #4a9fd4;
  --pur: #a78bfa;
  --org: var(--color-orange);
  --eagle: var(--color-eagle-bg);
  --birdie: var(--color-birdie-bg);
  --par: var(--color-par-bg);
  --bogey: var(--color-bogey-bg);
  --dbl: var(--color-dbl-bg);
  --tpl: var(--color-tpl-bg);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'Noto Sans JP', 'Helvetica Neue', sans-serif;
  background: var(--color-base);
  color: var(--color-text-dark);
  -webkit-font-smoothing: antialiased;
}
```

---

## Step 10: layout.tsx（PWAメタタグ）

`src/app/layout.tsx` を作成：

```tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shotty Golf',
  description: '自分専用のキャディを、ポケットに。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Shotty',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0d1f0d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## Step 11: PWA設定

`public/manifest.json` を作成：

```json
{
  "name": "Shotty Golf",
  "short_name": "Shotty",
  "description": "自分専用のキャディを、ポケットに。",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d1f0d",
  "theme_color": "#0d1f0d",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

`next.config.js` を作成：

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'google-maps',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

module.exports = withPWA(nextConfig)
```

---

## Step 12: pm2 設定

`ecosystem.config.js` をプロジェクトルートに作成：

```javascript
module.exports = {
  apps: [
    {
      name: 'shotty',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/shotty',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
```

---

## Step 13: GitHub Actions 自動デプロイ

`.github/workflows/deploy.yml` を作成：

```yaml
name: Deploy Shotty

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_KEY }}
          script: |
            cd /var/www/shotty
            git fetch origin
            git rebase origin/main
            npm install
            npm run build
            pm2 restart shotty
            echo "Deployed at $(date)"
```

GitHubリポジトリの `Settings > Secrets and variables > Actions` に登録：

| シークレット名 | 値 |
|---|---|
| `VPS_HOST` | ConoHaのIPアドレス |
| `VPS_USER` | shotty |
| `VPS_KEY` | SSH秘密鍵（`-----BEGIN`から全部） |

---

## Step 14: メイン画面（page.tsx）の実装方針

`src/app/page.tsx` は以下の構成で作成してください：

```tsx
'use client'

// 現行の index.html の構造をそのまま React コンポーネントに変換する
// 状態管理は useState / useReducer を使う
// localStorage アクセスは useRound / useClubs フックを使う
// Google Maps は @vis.gl/react-google-maps の APIProvider + Map を使う

// 画面構成:
// <Header />                    ← ハンバーガー・ロゴ・GPS・履歴ボタン
// <Sidebar />                   ← ハンバーガーメニュー（コース選択）
// <GolfMap />                   ← Google Maps本体
// <YardageBar />                ← F/C/Bヤード表示
// BottomBar                     ← 測定/記録タブ・⛳INボタン
// <ShotPanel />                 ← ショット登録パネル
// <CupPanel />                  ← カップインパネル
// <HoleSummary />               ← ホールサマリー
// <ReviewPanel />               ← ショット履歴
// <HistoryPanel />              ← ラウンド履歴
// <ClubEditor />                ← クラブセット編集

// 重要: 現行アプリのロジックを以下のファイルから移植する
// - app/core.js    → useState の初期値・ヘルパー関数
// - app/shot.js    → ShotPanel / CupPanel / HoleSummary コンポーネント
// - app/map.js     → GolfMap コンポーネント
// - app/measure.js → GolfMap 内の測定モード処理
// - app/sidebar.js → Sidebar / HoleStrip コンポーネント
// - app/clubs.js   → ClubEditor コンポーネント
// - app/history.js → HistoryPanel コンポーネント
```

---

## Step 15: Google Maps 実装ポイント

`@vis.gl/react-google-maps` の基本的な使い方：

```tsx
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'

// APIProviderで囲む（layout.tsx または page.tsx）
<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
  <Map
    mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
    defaultCenter={{ lat: 35.0, lng: 136.0 }}
    defaultZoom={17}
    mapTypeId="hybrid"
    gestureHandling="greedy"
    disableDefaultUI={true}
    tilt={45}
  />
</APIProvider>

// 地図インスタンスへのアクセス
const map = useMap()
```

現行コードの `google.maps.Marker` → `AdvancedMarkerElement` に移行：

```tsx
import { AdvancedMarker } from '@vis.gl/react-google-maps'

<AdvancedMarker position={{ lat, lng }}>
  <div className="shot-pin">{shotNo}</div>
</AdvancedMarker>
```

現行コードの `google.maps.Polyline` → `Polyline` コンポーネントに移行：

```tsx
import { Polyline } from '@vis.gl/react-google-maps'

<Polyline
  path={[{ lat: la1, lng: lo1 }, { lat: la2, lng: lo2 }]}
  strokeColor="#2ecc71"
  strokeWeight={2.5}
  strokeOpacity={0.7}
/>
```

---

## 現行 style.css → Tailwind 移行方針

- 既存のCSSクラス名はそのまま `className` で使う
- `globals.css` に現行の `style.css` をそのままコピーしてもOK
- 徐々に Tailwind に置き換えていく
- ブランドカラーは `globals.css` のCSS変数で管理済み

---

## 動作確認チェックリスト

```
ローカル確認
□ npm run dev でhttp://localhost:3000が起動する
□ コース選択ができる
□ Google Mapsが表示される
□ ショット記録ができる
□ スコア入力ができる
□ ホールサマリーが表示される
□ クラブ編集ができる
□ ラウンド履歴が表示される
□ localStorageにデータが保存されている

PWA確認
□ /manifest.json にアクセスできる
□ iPhoneのSafariで「ホーム画面に追加」が表示される
□ ホーム画面のアイコンからアプリが起動する

ビルド確認
□ npm run build がエラーなく完了する
□ npm start で本番ビルドが起動する
```

---

## ⚠️ 実装時の注意事項

### Safari / WebKit 対応
- テンプレートリテラルのネストは避け、文字列連結で書く
- iOS Safari での GPS は HTTPS でないと動作しない（本番のみ）

### 'use client' 指定
- localStorage を使うコンポーネントには必ず `'use client'` を付ける
- Google Maps を使うコンポーネントにも `'use client'` が必要

### 現行データとの互換性
- localStorage のキー名・データ構造は現行と同じにする
- `golfRounds`・`golfClubSet` のキー名を変えない
- 現行アプリからのデータ移行が自動でできるように

### CSS変数
- `globals.css` にレガシー変数（`--gd`、`--gv` 等）を定義済み
- 現行 style.css をそのままコピーしても動作するように互換性を保つ

---

*cursor_setup_no_auth_pwa.md — Shotty ログインなし PWA版セットアップ指示書*

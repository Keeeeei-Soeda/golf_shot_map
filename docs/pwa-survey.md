# PWA 現状調査（Phase 0）

**対象：** `https://beta.shotty.net`（`shotty/` の Next.js アプリ）
**目的：** 「ホーム画面に追加」からの起動で全画面（standalone）表示にする
**調査日：** 2026-08-24

---

## 1. フレームワーク・配置

| 項目 | 内容 |
|---|---|
| フレームワーク | Next.js 14.2.35（App Router） |
| アプリルート | `shotty/` |
| head 定義 | `shotty/src/app/layout.tsx`（`metadata` / `viewport` エクスポート） |
| 静的ファイル | `shotty/public/` |
| beta 配信 | VPS `160.251.213.110:3001` → nginx（`docs/ops/beta-shotty-net.md`） |
| HTTPS | 済（Let's Encrypt）。PWA の配信要件は満たす |

---

## 2. `<head>` の現状

`shotty/src/app/layout.tsx` で以下が既に設定されている。

| 項目 | 現状値 | 指示書の要求 | 判定 |
|---|---|---|---|
| `manifest` | `/manifest.json` | 同じ | OK |
| `viewport-fit` | `cover` | `cover` | OK |
| `width` / `initial-scale` | `device-width` / `1` | 同じ | OK |
| `theme-color` | `#0d1f0d` | バー色に合わせる | 要確認（実際のヘッダー色は `#0a160a`〜`#162816`） |
| `apple-mobile-web-app-capable` | `yes` | `yes` | OK |
| `apple-mobile-web-app-status-bar-style` | `black-translucent` | 同じ | OK |
| `apple-mobile-web-app-title` | `Shotty` | `SHOTTY` | 要変更 |
| `apple-touch-icon` | `/icons/icon-192.png` | 180×180 の専用ファイル | **要修正（実体なし）** |

つまり **メタタグはほぼ揃っている**。不足しているのは実体ファイルと名称・サイズの調整。

---

## 3. `manifest.json` の現状

`shotty/public/manifest.json`

| キー | 現状値 | 指示書の要求 | 判定 |
|---|---|---|---|
| `name` | `Shotty Golf` | `SHOTTY caddy` | 要変更 |
| `short_name` | `Shotty` | `SHOTTY` | 要変更 |
| `start_url` | `/` | `/` | OK（下記4参照） |
| `display` | `standalone` | `standalone` | OK |
| `background_color` | `#0d1f0d` | ダーク背景 | 要確認（CSS の背景は `--gd:#0f1f0f`） |
| `theme_color` | `#0d1f0d` | バー色 | 要確認 |
| `orientation` | `portrait` | `portrait` | OK |
| `icons` 192 | `/icons/icon-192.png` | 必須 | **ファイルが存在しない** |
| `icons` 512 | `/icons/icon-512.png`（`purpose: "any maskable"`） | any と maskable は分離が望ましい | **ファイルが存在しない** ＋ 要分離 |

---

## 4. `start_url` の妥当性

`shotty/src/app/page.tsx` がプレー画面そのもの（Header / GolfMap / ShotPanel などを直接描画）。
LP を経由しないため **`start_url: "/"` はそのままで妥当**。

---

## 5. 既存アイコン資産

`shotty/public/icons/` の実体：

| ファイル | 用途 |
|---|---|
| `icon-pin.png` / `icon-putter.png` / `icon-ruler.png` | UI ボタン用アイコン |
| `pin.png` / `putter.png` / `tee.png` / `tee-inline.png` | 地図・凡例用素材 |
| `candidates/1〜5.png` | UI アイコンの選定候補（ボール・パター等） |

**アプリアイコン（ホーム画面用）は 1 つも存在しない。**
`favicon.ico` は `shotty/src/app/favicon.ico` にあるのみ。

### これが最大の問題

`manifest.json` と `apple-touch-icon` が指す `icon-192.png` / `icon-512.png` は **どちらも 404**。
結果として：

- iOS：ホーム画面のアイコンがページのスクリーンショットになる（ブランドが出ない）
- Android Chrome：有効なアイコンがないため **インストール要件を満たさない**
- 起動スプラッシュにアイコンが出ない

### ブランド指針（既存 CSS より）

| 項目 | 値 |
|---|---|
| 背景（最暗） | `--gd: #0f1f0f` |
| ヘッダー | `#0a160a` → `--g1: #162816` グラデーション |
| アクセント（ロゴ文字色） | `--acc: #e8c84a`（金） |
| グリーン | `--gv: #4caf50` |
| ロゴ表記 | `SHOTTY` + `caddy`（Bebas Neue・字間広め） |

---

## 6. safe-area の現状

`env(safe-area-inset-*)` は **大部分が既に対応済み**。

### 対応済み

| 要素 | 対応 |
|---|---|
| `#bottomBar`（ホール表示バー） | `padding-bottom: calc(6px + env(safe-area-inset-bottom))` |
| `#shotPanel` / `#cupPanel` / `#reviewPanel` | 上下とも対応 |
| `.scp-header`（スコアカード）/ `.ce-header`（クラブ編集） | `padding-top` 対応 |
| `.side-actions`（右レール） | `right: calc(10px + env(safe-area-inset-right))` |
| `.map-btns` / `#yardageInfo`（右上） | `inset-right` 対応 |
| `.dist-card`（左上） | `inset-left` 対応 |
| `.sp-btns-main` | `padding-bottom` 対応 |

### 未対応（今回の修正対象）

| 要素 | 問題 |
|---|---|
| `header`（上部バー） | `height: 48px` 固定で `padding-top: env(safe-area-inset-top)` が **無い**。`black-translucent` + `viewport-fit=cover` のため、standalone 起動時にステータスバー（時刻・電池）とヘッダー内容が **重なる** |

`.dist-card` / `.map-btns` は `#mapWrap` 内（ヘッダーの下）にあるため、ヘッダーが正しく下がれば連動して回避される。

---

## 7. スコープ上の懸念：Service Worker が既に稼働している

指示書では Service Worker は今回スコープ外だが、**既に導入済み**である。

| 項目 | 状況 |
|---|---|
| `next-pwa` | `package.json` の dependencies に `^5.6.0` |
| `next.config.js` | `withPWA()` でラップ、`register: true` / `skipWaiting: true` |
| 生成物 | `shotty/public/sw.js`（16KB）・`workbox-f52fd911.js`（21KB）がコミット済み |
| キャッシュ対象 | Google Maps API（NetworkFirst）・Google Fonts（CacheFirst） |

つまり「今回 SW を追加する」必要はなく、**既存を削除するか維持するかの判断**になる。
削除は本番 `shotty.net` の挙動にも影響するため、判断を仰ぐ（下記「要判断」参照）。

---

## 8. 「全画面にならない」原因の切り分け

| 原因候補 | 判定 |
|---|---|
| `display: standalone` がない | 設定済み。原因ではない |
| Apple メタタグがない | 設定済み。原因ではない |
| `viewport-fit=cover` がない | 設定済み。原因ではない |
| **アイコンが 404** | **該当。ホーム画面アイコン／スプラッシュが正しく出ない** |
| ホーム画面追加時にアイコンが取得できず、追加自体をやり直している | 可能性あり |
| **ヘッダーが safe-area 未対応** | **該当。全画面化してもステータスバーと重なって「崩れて見える」** |

> 補足：iOS では一度ホーム画面に追加したアイコンは manifest の変更を再読み込みしない。
> 修正をデプロイした後は **既存アイコンを削除して再追加**する必要がある。

---

## 9. 残作業（ステップ1〜4）

| ステップ | 作業 | 規模 |
|---|---|---|
| 1 | `manifest.json` の名称・色・icons 定義を修正 | 小 |
| 2 | `layout.tsx` の apple title を `SHOTTY` に、`apple-touch-icon` を 180px 専用ファイルへ | 小 |
| 3 | **アイコン書き出し（192 / 512 / maskable 512 / 180）＝ 実質のメイン作業** | 中 |
| 4 | `header` に `padding-top: env(safe-area-inset-top)` を追加 | 小 |

---

## 10. 要判断（渓の確認事項）

1. **Service Worker（`next-pwa`）を維持するか外すか**
   指示書はスコープ外だが既に稼働中。維持を推奨（削除は本番にも影響し、リスクが今回の目的と無関係に増える）。
2. **アプリ名を `SHOTTY caddy` / `SHOTTY` に変更してよいか**
   `manifest.json` は本番 `shotty.net` と共有。本番のホーム画面名も変わる。
3. **アイコンのデザイン**
   既存アプリアイコンが無いため新規作成が必要。ブランド（ダークグリーン地＋金の `SHOTTY`）で作るか、別途用意した画像を使うか。

---

*作成: 2026-08-24 / Phase 0*

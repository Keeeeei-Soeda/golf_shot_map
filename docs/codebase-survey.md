# プレー画面 UXリニューアル — 既存コード調査書（Phase 0）

**作成日：2026年8月24日**
**対象：** SHOTTY caddy プレー画面（`shotty.net`）
**関連：** `docs/prompts/` の UXリニューアル指示書

---

## 1. 結論サマリ

| 論点 | 調査結果 |
|---|---|
| 対象画面 | **`/`（`shotty/src/app/page.tsx`）**。`/round/[roundId]` はラウンド後の振り返り専用で対象外 |
| 「UI層のみ再構築」の可否 | **不可**。UI層とロジック層が分離されていないため、`golf/logic.ts` のUI操作部分には必ず手が入る |
| スコア計算の流用 | **可能**。`confirmShot` / `confirmCupIn` / `saveRound` は独立して呼べるため無改変で流用できる |
| モード切替の廃止 | **容易**。`gs.appMode` の参照は全体で5箇所のみ |
| 仕様を既に満たす項目 | ピンの配色、打感の選択肢、ヘッダーのアイコン、打点からの距離計算、GPS起点記録 |

---

## 2. アーキテクチャの実態

### 2-1. Reactは「DOMの殻」

`page.tsx` と `src/components/**` は空の `<div id="...">` を並べるだけで、描画・状態更新・スコア計算のすべてが **`src/app/golf/logic.ts`（約1165行のバニラJS）** に集約されている。UI更新も `document.getElementById()` の直叩き。

動的生成HTMLの inline `onclick` から呼ぶため、`page.tsx` の `useEffect` で全関数を `window` に公開している（`page.tsx` L138-158）。

### 2-2. 状態管理

React state / Context / Zustand は**未使用**（認証の `useSession` のみ）。状態は mutable なグローバルオブジェクト。

| オブジェクト | ファイル | 内容 |
|---|---|---|
| `st` | `golf/state.ts` L39-45 | コース選択状態（`gcIdx` / `cIdx` / `hIdx` / `teeType`） |
| `gs` | `golf/state.ts` L50-112 | アプリ・マップ・ラウンド状態（`appMode` / `roundShots` / `map` / `pendingPos` 等） |

ホールキーは `` `${gcIdx}_${cIdx}_${hIdx}` `` 形式（`holeKey()` — `logic.ts` L154-160）。メタデータは同キー + `_meta`。

### 2-3. 永続化

ラウンド中は **localStorage のみ**。DBへはログイン後に `/api/sync` で一括投入する。

| キー | 用途 |
|---|---|
| `golfRounds` | ラウンド履歴 |
| `golfActiveRound` | 進行中ラウンド（リロード復帰用） |
| `golfClubSet` | クラブセット（14本・ユーザー編集） |

### 2-4. スタイリング

`src/app/globals.css` のグローバルCSS + CSS変数（`--gv` / `--blue` / `--acc` 等）が主力。プレー画面でTailwindは実質未使用。**この方式を踏襲する。**

### 2-5. Google Maps

`@vis.gl/react-google-maps` は `package.json` にあるが未使用。`<Script>` タグ + `window.google.maps` の直接利用。Map ID `c041c97b58243474e5cf18cb` は `logic.ts` L277 にハードコード。

---

## 3. 流用する既存ロジック（改変禁止）

### 3-1. ショット記録

`confirmShot()` — `logic.ts` L521-544

```ts
// 保存されるショットオブジェクト
{
  no: number; lat: number; lng: number
  club: string
  carry: number      // 打点からの距離（yd）
  remaining: number  // センターまでの残り（yd）
  fromLabel: string
  result: string | null
  isOB: boolean
  shotType: string | null
  shotFeel: string | null
}
```

前提となる `gs.pendingPos` と `gs.selectedClub` をセットしてから呼ぶ。距離計算は関数内部で完結している。

### 3-2. スコア確定

`confirmCupIn()` — `logic.ts` L601-612

```ts
// _meta に保存される内容
{
  cupIn: true
  par: number
  scoreDiff: number        // finalTotal - par
  totalShots: number       // par + cpSelectedDiff + cpStrokePenalty
  strokePenalty: number | null
  obType: string | null
  putts: number | null
}
```

入力は `gs.cpSelectedDiff` / `gs.cpStrokePenalty` / `gs.cpPutts`。**この関数自体は無改変で流用する。**

### 3-3. スコア定義・距離計算

| 関数 | 場所 | 用途 |
|---|---|---|
| `scoreDef(diff)` | `logic.ts` L118-120 | パー差 → 名称・CSSクラス |
| `SCORE_DEFS` | `state.ts` L7-14 | イーグル〜トリプルボギー |
| `haversine()` | `logic.ts` L161-165 | 距離（m）。`* 1.09361` でyd |
| `haversineYards()` | `lib/geo.ts` | 同等のクリーン実装 |

### 3-4. GPS起点の記録

`recordCurrentGps()` — `logic.ts` L739-751

`getCurrentPosition` → `updatePendingPos()` → `openShotPanelUI()` を実行する。**`appMode` に依存しないため、新UIの「現在地で記録」ボタンにそのまま接続できる。**

---

## 4. モード切替（`gs.appMode`）の依存箇所

参照は**5箇所のみ**。

| 場所 | 内容 | 対応方針 |
|---|---|---|
| `placePins` L296 | ピンタップで測定基準を切替（`measure`時のみ） | `measure`固定化で常時有効になる（仕様通り） |
| `onMapClick` L318 | `measure`なら測距、`record`なら記録 | `measure`固定化でタップ＝測距に一本化 |
| `updateInfo` L973 | 下部 `#modeInfo` の文言切替 | `#modeInfo` 廃止。null ガード済みで安全 |
| `updateRecBanner` L978 | 記録バナー表示 | `measure`固定で常に非表示になる（仕様通り） |
| `updateCupBtn` L984 | `⛳IN` ボタンの表示条件 | **要改変。** `appMode==='record'` 条件を外し常時表示に |

→ **`gs.appMode` を `'measure'` 固定にするだけで仕様3〜4の大半が成立する。** 改変が必要なのは `updateCupBtn` のみ。

---

## 5. すでに仕様を満たしている項目

| 受け入れ基準 | 実態 |
|---|---|
| Tマーカーが青 | `#4a9fd4`（`placePins` L299）で一致 |
| C=紫 / F=赤 / B=黄 | `#a78bfa` / `#e05252` / `#e8c84a` で仕様と完全一致 |
| 打感6種 | `_FEEL_LABELS`（L624）が `nice/slice/hook/over/fat/miss` で仕様と一致 |
| ヘッダーのアイコン | ピン・グラフ・クリップボードが配置済み（`Header.tsx` L13-24） |
| 打点→現在地の距離 | `updatePendingPos()` が `carry` として算出済み |

---

## 6. 発見した不具合

### ショット未記録でスコア確定すると「1打」で保存される

`openCupPanel`（L564）はショット0件のとき打数を `0 + 1 = 1` と計算し、`cpSelectedDiff = 1 - par` を保持する。この状態で `confirmCupIn` を呼ぶと `totalShots = par + (1 - par) = 1` が保存される。

**影響：** PAR4のホールが「1打（ホールインワン）」として記録される。UI上は打数が「—」と表示されるため気づけない。

**現状での再現条件：** `⛳IN` は記録モードでのみ表示されるため踏みにくいが、**仕様4-3でパットボタンを常時押下可能にすると常時踏める経路になる。** 対応必須。

---

## 7. 確定した判断事項

| # | 論点 | 決定 |
|---|---|---|
| 1 | ショット未記録時のスコア | **パット数とスコア（パー・ボギー等）だけを記録できるようにする。** 打数の自動算出（1打）は行わず、スコアボタンからの選択値を採用する |
| 2 | 下部から外す `📋レビュー` / `↺クリア` | **ショット登録パネル／スコアパネル内に移設する** |
| 3 | 左上カードのGPS未取得時 | **「-- yd」と表示し、GPS取得を促す** |
| 4 | ペナルティ・OB・打ち直し入力 | **パネル内に折りたたみ／サブ画面として残す**（既存機能を壊さない） |
| 5 | クラブ選択リスト | **既存クラブセット（`gs.CLUBS`・localStorage・14本編集機能）を流用する。** 仕様の固定リストを採用するとクラブセット編集機能が機能しなくなるため |
| 6 | `any` 使用0 | **新規追加ファイルのみ `any` ゼロを厳守。** `logic.ts` の既存 `any` は触らない（解消には大規模リファクタが必要で、指示書7章と衝突する） |

---

## 8. 実装計画

### ステップ1：基本レイアウトの骨組み

- `GolfMap.tsx` の `#bottomBar` を「◀ H2 PAR 3 ▶」のみに再構成
- 左上に残り距離カードを新設（現在地 → C、GPS未取得時は `-- yd`）
- `globals.css` にスタイル追加
- `#modeInfo` 廃止に伴う `updateInfo` の動作確認（null ガード済み）

**完了条件：** マップが全画面表示され、上下の固定要素が正しく配置される

### ステップ2：右サイド正円ボタン群

- 新規 `SideActions.tsx`（径60px固定・円内アイコンのみ・ラベルは円外）
- 上から `測定ON` → `パット` → `現在地で記録`
- 既存 `YardageBar` の `#gpsRecBtn` をここへ統合

**完了条件：** 3ボタンが同径正円・径56〜64px・ラベルが円外・タップ範囲確保

### ステップ3：測定インタラクション

- `gs.appMode` を `'measure'` 固定化
- タップ地点の吹き出し（打点から ◯yd / ピンまで残り ◯yd）を新設
- 右サイドボタン列の手前に透明ガターを置き、`pointer-events` で測距の誤発火を防止

**完了条件：** タップで測距吹き出しが出て、右サイド押下時に測距が誤発火しない

### ステップ4：ショット登録パネル

- `recordCurrentGps()` を「現在地で記録」に接続（無改変）
- クラブ選択は既存クラブセットを流用
- 打感は既存6種を流用
- ペナルティ・OBは折りたたみで残す
- `📋レビュー` / `↺クリア` をパネル内に移設

**完了条件：** 現在地で記録 → パネル表示 → 登録 → 測定状態復帰の一連が動く

### ステップ5：パット・スコア登録パネル

- `CupPanel` にパット `5+` を追加
- 常時押下可能に（`updateCupBtn` の `appMode` 条件を外す）
- ショット未記録時の初期スコアを判断1に従って修正（**6章の不具合対応**）
- `confirmCupIn` は無改変

**完了条件：** パット数＋スコア確定 → 次ホールへ。ショット未記録でも単独で確定でき、打数が不正な「1打」にならない

### ステップ6：例外操作（長押し記録）

- Google Maps に longpress イベントは無いため、`mousedown` / `mouseup` + タイマーで新規実装
- 通常タップの測距とは閾値で分離

**完了条件：** 長押しで記録フローに入る。通常タップの測距に影響しない

---

## 9. 主要ファイル一覧

### 改変対象

| ファイル | 内容 |
|---|---|
| `shotty/src/components/map/GolfMap.tsx` | 下部バー再構成・レイアウト |
| `shotty/src/components/map/YardageBar.tsx` | 右サイドへの統合 |
| `shotty/src/components/map/CupPanel.tsx` | パット5+・常時押下 |
| `shotty/src/components/map/ShotPanel.tsx` | クラブ・打感・折りたたみ |
| `shotty/src/app/globals.css` | 新UIのスタイル |
| `shotty/src/app/golf/logic.ts` | **UI操作部分のみ。** 計算・保存ロジックは触らない |

### 新規作成

| ファイル | 内容 |
|---|---|
| `shotty/src/components/map/SideActions.tsx` | 右サイド正円ボタン群 |
| `shotty/src/components/map/DistanceCard.tsx` | 左上残り距離カード |

### 改変禁止

| ファイル / 関数 | 理由 |
|---|---|
| `confirmShot()` / `confirmCupIn()` / `saveRound()` | スコア計算・保存ロジック |
| `shotty/prisma/schema.prisma` | データスキーマ |
| `shotty/src/lib/round-mapper.ts` | DB同期の変換ロジック |
| `shotty/src/app/api/**` | 保存処理 |

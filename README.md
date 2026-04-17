# ⛳ Golf Tracker — 開発ドキュメント

**最終更新：2026年3月25日**
**URL：** https://keeeeei-soeda.github.io/golf_shot_map/
**リポジトリ：** git@github.com:Keeeeei-Soeda/golf_shot_map.git

---

## 1. システム概要

個人利用のゴルフラウンド記録・距離測定Webアプリ。
Google Maps（衛星写真）上でショットを記録し、クラブ・飛距離・スコアを管理する。

> **アクセス方法：** `https://keeeeei-soeda.github.io/golf_shot_map/` をブラウザで開くだけで使える。インストール不要。iPhoneのSafariでも動作。

### 技術スタック

| 項目 | 内容 |
|---|---|
| ホスティング | GitHub Pages（無料・公開URL） |
| 地図 | Google Maps JavaScript API（hybridモード・ベクターレンダリング） |
| データ保存 | localStorage（最大30ラウンド・端末内のみ） |
| フレームワーク | なし（Vanilla HTML/CSS/JS） |
| フォント | Noto Sans JP / Bebas Neue（Google Fonts） |

---

## 2. ファイル構成

```
golf_shot_map/
├── README.md         ← このファイル
├── index.html        ← HTML骨格のみ
├── style.css         ← スタイル全て
├── courses.js        ← ★編集するコースデータ
├── picker.html       ← 座標登録ツール（別ページ）
└── app/              ← アプリロジック（機能別に分割）
    ├── core.js       状態・定数・ヘルパー・ラウンド保存
    ├── sidebar.js    メニュー・コース選択・ホールストリップ・モード切替
    ├── map.js        地図・ホール読み込み・ピン配置・回転・ヤードパネル
    ├── measure.js    測定モード
    ├── shot.js       ショット記録・カップイン・サマリー・スコアカード
    ├── clubs.js      クラブセット編集パネル
    └── history.js    ラウンド履歴・GPS・ShotNaviリンク
```

### 読み込み順（index.html）

```html
<script src="courses.js"></script>
<script src="app/core.js"></script>   <!-- 最初（状態・ヘルパー定義） -->
<script src="app/sidebar.js"></script>
<script src="app/map.js"></script>
<script src="app/measure.js"></script>
<script src="app/shot.js"></script>
<script src="app/clubs.js"></script>
<script src="app/history.js"></script>
```

> ⚠️ `core.js` は全ファイルが依存するため必ず最初に読み込むこと。

---

## 3. 登録済みコースデータ

### ローズゴルフクラブ（滋賀県）GCID: 970

| コース | PAR | Back | Reg | Ladies |
|---|---|---|---|---|
| アウト CID:1312 | 36 | 3,396 | 3,213 | 2,537 |
| イン CID:1313 | 36 | 3,430 | 3,034 | 2,609 |
| **合計** | **72** | 6,826 | 6,247 | 5,146 |

### 亀岡ゴルフクラブ【アコーディア・ゴルフ】（京都）GCID: 456

| コース | PAR | Back | Reg | Ladies |
|---|---|---|---|---|
| アウト CID:1312 | 36 | 3,269 | 3,034 | 2,404 |
| イン CID:1313 | 36 | 3,316 | 3,017 | 2,342 |
| **合計** | **72** | 6,585 | 6,051 | 4,746 |

### れいせんゴルフ倶楽部（京都）GCID: 459

| コース | PAR | Back | Reg | Ladies |
|---|---|---|---|---|
| アウト | 36 | 3,375 | 3,115 | 2,700 |
| イン | 36 | 3,360 | 3,190 | 2,810 |
| **合計** | **72** | 6,735 | 6,305 | 5,510 |

---

## 4. 実装済み機能

### 📏 測定モード

- 地図タップ → 起点（ティーまたは前打地点）からの距離（青線）を表示
- デフォルトターゲット：センター（C）固定
- F・C・Bのマーカーをタップするとそのピンへの距離に切替
- 地図上に距離ラベル（青：飛距離、黄：残り距離）をリアルタイム表示
- 右上パネルに `第N打→F / →C / →B` を表示（打数に連動して自動更新）

### 🏌️ 記録モード（タブ式パネル）

- 地図タップ → ボール落下地点として登録
- **🏌️ 記録タブ（デフォルト）**：クラブ選択（14スロット・7列2行）
- **📏 飛距離確認タブ**：carry（飛距離）・remaining（残り距離）を表示
- ⛳ IN ボタンでカップイン（打数+1で正確にカウント）
- スコア手動変更可能（イーグル〜トリプルボギー）
- 記録バナーは地図下部に表示（上部アイコンと干渉しない）

### 🔧 クラブセット編集

- ハンバーガーメニュー → 「クラブセット編集」から全画面パネルで編集
- ドライバー/FW/UT/アイアン/ウェッジ/パターのプリセットから選択
- その他は自由入力可能（例：48°）
- 最大14本・最小1本のバリデーション
- クラブは長い順（ドライバー→パター）に自動ソート
- localStorageに保存（次回起動時も維持）

### 📊 カップイン後サマリー

- ショット詳細：1打目から全打のクラブ・飛距離・残り距離
- スコアカード：全ホール分を表形式で表示（色付きスコアバッジ）
- スコアは `totalShots - par` で再計算（手動変更との整合性を保証）

### 💾 データ保存

- localStorageに自動保存（最大30ラウンド・端末ローカル）
- 📋 履歴ボタンから過去ラウンドを参照可能

### 📍 GPS

- 現在地リアルタイム追尾
- 記録モード中にGPSボタン → 現在地でショット登録

### 🗺 地図操作

- `⛳↑` / `🧭N` ボタン（横並び・右上）：ホール方向↔北向きをトグル
- `📐` ボタン：ヤード情報パネルの開閉
- 凡例（T/F/C/B フルネーム）：ホール選択時に表示 → 操作すると消える
- F/Bピン：2打目以降のみ表示（1打目はT/Cのみ）

---

## 5. Google Maps API 設定

| 項目 | 内容 |
|---|---|
| APIキー | `AIzaSyBryPip32SP4e5y2RBSDyKLbxoz313JAgU` |
| リファラー制限 | `https://keeeeei-soeda.github.io/*` |
| Map ID | `c041c97b58243474e5cf18cb` |
| マップ名 | Golf_shot_navi |
| レンダリング | **ベクター**（ローテーション有効） |
| mapTypeId | hybrid |

> ⚠️ APIキーはリファラー制限設定済み。`keeeeei-soeda.github.io` 以外からは動作しない。
> 他の人に使わせる場合は、自分のGCPで別のAPIキーを発行してリファラーを設定すること。

### 地図回転のしくみ

```
ラスターモード（デフォルト）→ setHeading() が無視される
ベクターモード（Map ID必須）→ setHeading() が有効
```

Google Cloud Console → Google Maps Platform → マップの管理 → Golf_shot_navi（ベクター・ローテーション有効）

---

## 6. picker.html（18H座標登録ツール）

**URL：** https://keeeeei-soeda.github.io/golf_shot_map/picker.html

```
ゴルフ場名・都道府県・アウト/イン名を入力
  ↓
下部の検索ボックスでゴルフ場名を検索 → 地図が自動移動
  ↓
H1〜H18のタブを選択（アウト=青上辺、イン=紫上辺）
  ↓
T → F → C → B の順で地図をクリック（自動で次の地点へ）
  ↓
「courses.js形式でコピー」ボタン
  ↓
courses.js に貼り付けてプッシュ
```

- 1ホール = 4クリック、18ホール = 72クリック（約20〜30分）
- アウト（H1-9）・イン（H10-18）を一括登録して2ブロック出力
- 完了ホールに緑ドット表示

---

## 7. デプロイ手順

> ⚠️ 詳細は `docs/deploy.md` を参照すること（Cursor AIエージェントはそちらを正とする）

```bash
cd ~/golf_shot_map
git add .
git commit -m "変更内容のメモ"
git push origin main
```

**`git push` の1コマンドで以下が自動実行される：**

| 対象 | 反映先 | 反映時間 |
|---|---|---|
| GitHub Pages | `https://keeeeei-soeda.github.io/golf_shot_map/` | 1〜2分 |
| ConoHa VPS | `https://shotty.net` | 2〜3分 |

VPS へのデプロイは GitHub Actions（`.github/workflows/deploy.yml`）が SSH 経由で自動実行する。

---

## 8. データ構造（localStorage）

```javascript
golfRounds: [
  {
    id: "round_1234567890",
    date: "2026/3/25",
    gcName: "ローズゴルフクラブ",
    courseName: "アウト",
    shots: {
      "gcIdx_cIdx_hIdx": [
        {
          no: 1, club: "1W",
          carry: 230, remaining: 270,
          lat: 34.xxx, lng: 136.xxx,
          fromLabel: "ティー"
        }
      ],
      "gcIdx_cIdx_hIdx_meta": {
        cupIn: true,
        scoreDiff: 1,   // パーとの差（+1=ボギー）
        par: 4,
        totalShots: 5   // 実打数（スコア計算の基準）
      }
    }
  }
]
```

---

## 9. 今後の開発余地

| 機能 | 概要 | 難易度 |
|---|---|---|
| デバッグログ削除 | console.log を本番コードから除去 | ★☆☆ |
| クラブ別飛距離統計 | 保存済みデータを集計して表示 | ★★☆ |
| CSVエクスポート | ラウンドデータをCSVでダウンロード | ★★☆ |
| ピンポジション入力 | 当日のカップ位置を手動設定 | ★★☆ |
| AdvancedMarkerElement移行 | Marker非推奨警告の解消 | ★★☆ |
| 複数ユーザー対応 | ログイン・クラウド保存 | ★★★★ |

---

## 10. 開発履歴

| 日付 | 内容 |
|---|---|
| 2026/3/24 | 初期バージョン（距離測定のみ） |
| 2026/3/24 | ショット記録・カップイン・スコア記録追加 |
| 2026/3/24 | 4ファイル分割（index/style/app/courses） |
| 2026/3/24 | picker.html 追加（座標登録ツール） |
| 2026/3/25 | ローズGC 全18ホール座標・par・ヤード登録完了 |
| 2026/3/25 | ヤードパネル追加・測定改善・F/C/B切替対応 |
| 2026/3/25 | カップイン修正・サマリー追加・スマホ対応 |
| 2026/3/25 | ハンバーガーメニュー実装 |
| 2026/3/25 | app.jsを7ファイルに分割 |
| 2026/3/25 | クラブセット編集機能追加（14本・自動ソート） |
| 2026/3/25 | スコア表示ロジック修正（totalShots-parで統一） |
| 2026/3/25 | Google Cloud ConsoleでカスタムMap ID発行 → 地図回転問題解決 ✅ |
| 2026/3/25 | picker.html: 18H一括登録・検索ボックス追加 |
| 2026/3/25 | 亀岡GC追加（PAR72・公式データ確認済み） |
| 2026/3/25 | れいせんGC追加（PAR72・楽天GORAデータ確認済み） |
| 2026/3/25 | ヤードパネル打数連動・F/B2打目以降表示・凡例改善 |
| 2026/3/25 | 記録バナーを地図下部に移動・サイドバー幅スマホ対応 |

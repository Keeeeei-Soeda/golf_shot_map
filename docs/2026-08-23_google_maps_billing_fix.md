# Google Maps「For development purposes only」エラー — 発生から解消まで

**日付:** 2026-08-17 〜 2026-08-23  
**対象:** `https://shotty.net` / GitHub Pages（`index.html` / `picker.html`）

---

## 1. 何が起きていたか

地図が暗くなり、全面に **「For development purposes only」** の透かしが出た。  
アプリ本体のバグではなく、**Google Maps Platform（GCP）側の課金・APIキー問題**だった。

---

## 2. 原因の整理

| 順番 | 原因 | 内容 |
|---|---|---|
| 1 | **無料クレジット期限切れ** | GCP Free Credit が「期限切れ」。残額表示があっても使えない |
| 2 | **課金アカウント未リンク（または実質無効）** | Maps API が `You must enable Billing` で 403 |
| 3 | **アプリの API キーが古い** | `index.html` / `picker.html` / VPS `.env.local` のキーが、課金有効な Shottygolf 現行キーと不一致 |

課金だけ直しても、**古いキーのままでは透かしが残る**。キー差し替えまで必要だった。

---

## 3. 対応の流れ（時系列）

### Step A — 症状確認
- `picker.html` / 本番地図で透かしを確認
- リファラー制限・課金・キーのどれかを疑い、API を叩いて切り分け
- Static Maps 等が **Billing 未有効の 403** を返していることを確認

### Step B — GCP 課金まわり
- アカウント: `k.soeda.shottygolf@gmail.com`
- プロジェクト: **Shottygolf**（`shottygolf`）
- 「予算とアラート」だけでは不足。本体は **課金アカウントのリンク + 支払い方法**
- 予算 `shorty_map_api`（月 ¥1,000）は使いすぎ防止用（地図復旧の直接原因ではない）
- 結果: Shottygolf で `billingEnabled: true`

### Step C — gcloud 導入と疎通確認
- Homebrew が使えなかったため、プロジェクト内 `.tools/google-cloud-sdk/` に CLI を導入
- `gcloud auth login` で上記アカウントにログイン
- Shottygolf の **現行 Maps キー** で Static Map が HTTP 200 になることを確認
- アプリ埋め込みの古いキーは引き続き失敗 → **キー不一致が本命**と確定

### Step D — キー差し替え
差し替え先: Shottygolf の現行 Maps Platform API Key

| 場所 | 対応 |
|---|---|
| `index.html` / `picker.html` | 直書きキーを更新 |
| `README.md` | リファラー説明を更新 |
| `shotty/.env.local`（ローカル・gitignore） | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` を更新 |
| VPS `/var/www/shotty/shotty/.env.local` | 同上 → `npm run build` → `pm2 restart shotty` |

あわせてキーの HTTP リファラー制限を設定:

- `https://shotty.net/*`
- `https://www.shotty.net/*`
- `https://keeeeei-soeda.github.io/*`
- `http://localhost:3000/*`
- `http://127.0.0.1:3000/*`

### Step E — VPS 接続（`.pem`）
- パスワード SSH は不可。専用鍵 **`shotty_golf.pem`** が必要（リポジトリ直下、`*.pem` で gitignore）
- 接続例:

```bash
chmod 600 shotty_golf.pem
ssh -i shotty_golf.pem root@160.251.213.110
```

- 更新ヘルパー: `scripts/update-vps-maps-key.sh`（PEM 対応済み）

### Step F — Git 反映
- コミット・プッシュ（SSH が別 GitHub アカウントに向いていたため、`gh` の HTTPS トークンで push）
- 主なコミット:
  - `c59ec87` — Shottygolf 課金済みキーへ差し替え
  - `f7a1372` — README 表・HTML 整形の修正

### Step G — 復旧確認
- `https://shotty.net` で衛星地図・T/C ピン表示を確認
- 透かし消失を確認（2026-08-23）

---

## 4. いまの正しい構成（メモ）

| 項目 | 値 |
|---|---|
| GCP プロジェクト | Shottygolf (`shottygolf`) |
| ログインアカウント | `k.soeda.shottygolf@gmail.com` |
| 本番 | `https://shotty.net`（VPS・Next.js・環境変数のキー） |
| GitHub Pages | `index.html` / `picker.html` の直書きキー |
| VPS | `root@160.251.213.110` / 鍵 `shotty_golf.pem` |
| Map ID | `c041c97b58243474e5cf18cb`（ベクター・回転用） |

---

## 5. 再発したときのチェックリスト

1. GCP で **Shottygolf** を選び、課金が有効か（支払い方法・リンク）
2. Maps JavaScript API / Places API が有効か
3. アプリのキーが **Shottygolf の現行キー** と一致しているか（VPS `.env.local` 含む）
4. リファラーに、開いている URL（`shotty.net` / GitHub Pages / localhost）が入っているか
5. ブラウザでハードリロードして透かしが消えるか

---

## 6. やってはいけないこと

- `shotty_golf.pem` や `.env.local` を Git にコミットしない
- 「予算だけ作って」課金リンクを済ませたつもりにならない
- 課金済みプロジェクトと、HTML / VPS に入っているキーのプロジェクトが違う状態を放置しない

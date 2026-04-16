# Shotty VPS セットアップ & デプロイ 最終手順書

# Shotty VPS セットアップ & デプロイ 最終手順書

> VPS IP: 160.251.213.110
> OS: Ubuntu 24.04 LTS
> ドメイン: shotty.net
> リポジトリ: github.com/Keeeeei-Soeda/golf_shot_map
> デプロイ先: /var/www/shotty
> Node.js: 20 LTS
> プロセス管理: pm2
> Webサーバー: Nginx（リバースプロキシ）

---

## ⚠️ 最重要：GitHubを常に正とすること

```
この手順書は作成時点のスナップショットです。
実際のコードはGitHubの最新状態と異なる可能性があります。
```

### 基本ルール

| 項目 | 優先度 |
|---|---|
| GitHubの最新ファイル（main ブランチ） | **最優先（正）** |
| この手順書の内容 | 参考・方針のみ |

- `ecosystem.config.js` → GitHubの最新版を使うこと
- `deploy.yml` → GitHubの最新版を使うこと
- `next.config.js` → GitHubの最新版を使うこと
- `package.json` → GitHubの最新版のスクリプト名を使うこと

### 差異が見つかった場合

1. **GitHubのコードを優先して作業を進める**
2. 差異の内容をメモしておく
3. **全作業完了後にまとめて報告する**

作業途中で都度確認を求めない。完了後に一括報告すること。

---

## ⚠️ 作業の流れ

```
【ローカル】                    【VPS】
Next.jsプロジェクト作成
    ↓
GitHubにpush
    ↓                →  VPS初期設定（Step1〜4）
                     →  git clone（Step5）
                     →  .env.local配置（Step5）
                     →  ビルド・pm2起動（Step6）
                     →  Nginx設定（Step7）
                     →  DNS設定（Step8）
                     →  SSL設定（Step9）
    ↓
GitHub Actionsの設定（Step9）
    ↓
以後はgit pushするだけで自動デプロイ ✅
```

---

## ⚠️ ディレクトリ構成の理解（必読）

このリポジトリ (`golf_shot_map`) は **バニラJS版と Next.js版の両方を含む** 構成です。

```
golf_shot_map/          ← GitHubリポジトリのルート
├── index.html          ← バニラJS版（静的ページ）
├── app.js
├── swing.html
├── shotty/             ← ★ Next.js プロジェクト（Shotty本体）
│   ├── package.json
│   ├── next.config.js
│   ├── ecosystem.config.js
│   ├── src/
│   └── public/
└── ...
```

VPS にクローンすると以下のパス構成になります：

```
/var/www/
└── shotty/                 ← git clone 先（リポジトリルート）
    ├── index.html
    └── shotty/             ← ★ Next.js プロジェクト（作業対象）
        ├── package.json
        ├── ecosystem.config.js
        └── src/
```

> **重要**: `npm install`, `npm run build`, `pm2 start` はすべて `/var/www/shotty/shotty` で実行します。

---

## Step 1: SSH接続

ローカルのターミナルで実行：

```bash
ssh root@160.251.213.110
```

---

## Step 2: システム初期設定

```bash
apt update && apt upgrade -y
apt install -y git curl wget ufw
```

---

## Step 3: ファイアウォール設定

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
ufw status
```

---

## Step 4: Node.js 20 + pm2 インストール

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
node -v
npm -v
npm install -g pm2
pm2 -v
```

---

## Step 5: アプリのデプロイ

### 5-1. デプロイ先ディレクトリ作成

```bash
mkdir -p /var/www/shotty
```

### 5-2. GitHubからクローン

```bash
cd /var/www
git clone https://github.com/Keeeeei-Soeda/golf_shot_map.git shotty
cd shotty
```

### 5-3. .env.local をVPSに配置

> **配置先は `/var/www/shotty/shotty/.env.local`（Next.jsプロジェクト直下）**

**ローカルで別ターミナルを開いて**以下を実行：

```bash
# ローカルの shotty/.env.local を VPS の Next.js プロジェクト直下に転送
scp shotty/.env.local root@160.251.213.110:/var/www/shotty/shotty/.env.local
```

または VPS上で直接作成：

```bash
nano /var/www/shotty/shotty/.env.local
```

内容：
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=あなたのAPIキー
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=c041c97b58243474e5cf18cb
NEXTAUTH_URL=https://shotty.net
GEMINI_API_KEY=あなたのGemini APIキー
GEMINI_MODEL=gemini-2.5-flash-lite
```

### 5-4. パッケージインストール・ビルド

> **必ず Next.js プロジェクトのディレクトリ（`shotty` サブディレクトリ）に移動してから実行する**

```bash
cd /var/www/shotty/shotty
npm install
npm run build
```

### 5-5. pm2 で起動

```bash
# ecosystem.config.js がある Next.js プロジェクトディレクトリで実行
cd /var/www/shotty/shotty
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

⚠️ **`pm2 startup` が出力するコマンドを必ずコピーして実行すること（VPS再起動後の自動復帰に必須）**

出力例：
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

このコマンドをそのままターミナルに貼り付けて実行してください。

### 5-6. 動作確認

```bash
pm2 status
pm2 logs shotty --lines 20
```

> **⚠️ ポート3000について（重要）**
>
> Step 3 のファイアウォール設定では 3000番ポートを開けていません。
> ブラウザから `http://160.251.213.110:3000` に直接アクセスするには、一時的に開放する必要があります。
>
> - **方法A（一時確認用）**: `ufw allow 3000` → 確認後に `ufw delete allow 3000` で必ず閉じる
> - **方法B（推奨・安全）**: 3000番を開放せず、次の Step 6 で Nginx を設定してからドメインで確認する
>
> **セキュリティ優先なら方法B（3000番は一切外に出さない）を推奨します。**

---

## Step 6: Nginx インストール・設定

### 6-1. Nginx インストール

```bash
apt install nginx -y
systemctl enable nginx
systemctl start nginx
```

### 6-2. Nginx設定ファイル作成

```bash
nano /etc/nginx/sites-available/shotty
```

以下を貼り付け：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name shotty.net www.shotty.net;

    # ⚠️ スイング動画アップロード対応：デフォルト1MBを100MBに拡張
    # これがないと 413 Request Entity Too Large エラーになる
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 動画解析は時間がかかるためタイムアウトを延長（デフォルト60s）
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    # 静的ファイルのキャッシュ
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /icons/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

> **整合性メモ**: UI（`/swing` ページ）で「最大100MB」と案内しているため、Nginx 側も `100M` に揃えること。

### 6-3. 設定を有効化

```bash
ln -s /etc/nginx/sites-available/shotty /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Step 7: DNS設定

ドメイン管理画面（お名前.com / ムームードメイン）で以下を設定：

| タイプ | ホスト | 値 | TTL |
|---|---|---|---|
| A | @ | 160.251.213.110 | 3600 |
| A | www | 160.251.213.110 | 3600 |

DNS反映確認（数分〜最大24時間）：

```bash
nslookup shotty.net
# 160.251.213.110 が返ってくればOK
```

---

## Step 8: SSL証明書（Let's Encrypt）

> ⚠️ DNS反映後に実行すること

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d shotty.net -d www.shotty.net
```

対話形式：
- メールアドレス入力
- 利用規約: `A`
- HTTPSリダイレクト: `2`

自動更新確認：

```bash
certbot renew --dry-run
```

---

## Step 9: GitHub Actions 自動デプロイ設定

### 9-1. VPS側にデプロイ用SSH鍵を作成

VPS上で実行：

```bash
ssh-keygen -t ed25519 -C "github-actions-shotty" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/github_actions
```

`-----BEGIN OPENSSH PRIVATE KEY-----` から `-----END OPENSSH PRIVATE KEY-----` まで全部コピーしておく。

### 9-2. GitHubにシークレットを登録

`github.com/Keeeeei-Soeda/golf_shot_map` の
`Settings > Secrets and variables > Actions > New repository secret` で以下を追加：

| シークレット名 | 値 |
|---|---|
| `VPS_HOST` | `160.251.213.110` |
| `VPS_USER` | `root` |
| `VPS_KEY` | 秘密鍵の中身（`-----BEGIN`から全部） |

### 9-3. deploy.yml の確認

リポジトリの `.github/workflows/deploy.yml` が以下になっていることを確認：

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
            cd /var/www/shotty          # リポジトリルート
            git fetch origin
            git reset --hard origin/main  # VPS側の変更を強制上書き（rebaseより安全）
            cd shotty                   # Next.jsプロジェクトへ移動（必須）
            npm install
            npm run build
            pm2 restart shotty
            echo "Deployed at $(date)"
```

> **`cd shotty` について**: `/var/www/shotty` はリポジトリルートですが、Next.js プロジェクト本体は `shotty/` サブディレクトリにあります。この `cd shotty` は**必須**です（削除するとビルドが失敗します）。

### 9-4. 動作テスト

```bash
git add .
git commit -m "Setup auto deploy"
git push origin main
```

GitHubの `Actions` タブで緑チェック ✅ がつけば成功！

---

## 最終動作確認チェックリスト

```
VPS・インフラ
□ ssh root@160.251.213.110 でSSH接続できる
□ /var/www/shotty/shotty/.env.local が存在し、APIキーが設定されている
□ pm2 startup の出力コマンドをコピーして実行した（再起動後の自動復帰に必須）
□ pm2 save を実行した
□ pm2 status で shotty が online になっている
□ http://160.251.213.110:3000 でアプリが表示される（一時的に ufw allow 3000 が必要な場合あり）

ドメイン・SSL
□ http://shotty.net でアプリが表示される
□ https://shotty.net でSSLが有効（🔒マーク）
□ http:// → https:// に自動リダイレクトされる

PWA
□ iPhoneのSafariで「ホーム画面に追加」が表示される
□ ホーム画面のアイコンからアプリが起動する

自動デプロイ
□ git push で GitHub Actions が動く
□ Actions タブで緑チェックがつく
□ VPSに変更が自動反映される
```

---

## ⚠️ 重要チェックポイント（セキュリティ・安定性）

### 1. Nginx アップロードサイズ制限（`client_max_body_size`）

Nginx のデフォルトは **1MB** のため、スイング動画（数秒でも数十MB）をアップロードすると必ず `413 Request Entity Too Large` エラーになります。

Step 6-2 の設定ファイルに `client_max_body_size 100M;` が含まれていることを確認してください。

```bash
# 設定確認コマンド
grep -r "client_max_body_size" /etc/nginx/sites-available/
```

### 2. ファイアウォールと 3000番ポート

3000番ポートは **外部に公開しない** のが安全です（Step 3 では意図的に開けていません）。

```
推奨フロー:
  ブラウザ → Nginx (80/443) → pm2 (3000) ← VPS内部のみ
```

万が一テスト目的で開けた場合は **必ず閉じてください**：

```bash
ufw delete allow 3000
ufw status   # 3000が消えていることを確認
```

### 3. APIキーの保護

- `shotty/.env.local` は `.gitignore` に含まれており、**GitHub には絶対にアップロードされません**
- `index.html` など静的ファイルへの API キー直書きは **行わないこと**
- VPS 上の `.env.local` は `scp` または `nano` で直接配置する（Step 5-3 参照）

### 4. GitHub Actions: `git reset --hard` によるデプロイ安定化

`git rebase` はVPS側に意図しない変更があると競合して止まることがあります。
Step 9-3 の `deploy.yml` では `git reset --hard origin/main` を採用しています。

---

## トラブルシューティング

### pm2が起動しない

```bash
pm2 logs shotty --lines 50
# エラーログを確認
```

### Nginxエラー

```bash
nginx -t
journalctl -u nginx --no-pager -n 30
```

### ビルドがメモリ不足で失敗する

```bash
export NODE_OPTIONS="--max-old-space-size=512"
npm run build
```

### git rebase が失敗する（または GitHub Actions が止まる）

`deploy.yml` では `git reset --hard origin/main` を採用しているため、通常は発生しません。
手動でリカバリする場合も同じコマンドを使います：

```bash
cd /var/www/shotty
git fetch origin
git reset --hard origin/main
cd shotty
npm install
npm run build
pm2 restart shotty
```

---

*shotty_vps_deploy_final.md — IPアドレス・リポジトリ情報確定版*

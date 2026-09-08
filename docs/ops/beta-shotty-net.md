# beta.shotty.net（新UI 並行検証）

**目的：** 本番 `https://shotty.net`（現行UI）と `https://beta.shotty.net`（新プレー画面）を同時稼働し、動作確認する。  
**DB：** 本番と共有（`DATABASE_URL` 同じ / `NEXTAUTH_URL` のみ beta 用）

---

## URL 対応

| URL | プロセス | ポート | コード |
|---|---|---|---|
| `https://shotty.net` | `shotty` | 3000 | `/var/www/shotty`（`main`） |
| `https://beta.shotty.net` | `shotty-beta` | 3001 | `/var/www/shotty-beta`（feature 同期） |

HTTPS は sslh（`:443` → nginx `127.0.0.1:4443`）経由。本番と同じ。

---

## 初回セットアップ後に必要な作業（DNS / SSL / Maps）

### 1. DNS（お名前.com など）

| 種別 | ホスト | 値 |
|---|---|---|
| A | `beta` | `160.251.213.110` |

反映確認:

```bash
host beta.shotty.net 8.8.8.8
# → 160.251.213.110
```

### 2. SSL（DNS 反映後・VPS で実行）

```bash
certbot certonly --webroot -w /var/www/html -d beta.shotty.net
```

証明書ができたら Nginx の SSL 行を差し替え:

```nginx
ssl_certificate /etc/letsencrypt/live/beta.shotty.net/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/beta.shotty.net/privkey.pem;
```

```bash
nginx -t && systemctl reload nginx
```

### 3. Google Maps リファラー

Cloud Console → Maps API キーの HTTP リファラー制限に追加:

- `https://beta.shotty.net/*`

---

## beta の更新手順（ローカルから）

feature ブランチを GitHub に push できる場合は VPS で `git pull` でもよい。  
現状はローカル同期で更新する:

```bash
cd /path/to/golf_shot_map-1
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .env.local --exclude .env \
  --exclude shotty_golf.pem --exclude '.git' \
  -e 'ssh -i shotty_golf.pem -o IdentitiesOnly=yes -o PreferredAuthentications=publickey' \
  ./ root@160.251.213.110:/var/www/shotty-beta/

ssh -i shotty_golf.pem -o IdentitiesOnly=yes -o PreferredAuthentications=publickey root@160.251.213.110 '
  cd /var/www/shotty-beta/shotty
  # NEXTAUTH_URL は維持（rsync で .env.local は送らない）
  npm install
  pm2 stop shotty
  NODE_OPTIONS=--max-old-space-size=512 npm run build
  pm2 start shotty
  pm2 restart shotty-beta
'
```

> VPS メモリが約 1GB のため、**beta ビルド中だけ本番 `shotty` を一時停止**する。

---

## 注意

- ログイン Cookie はホスト別。beta では別途サインインが必要
- DB 共有のため、beta で書いたラウンドは本番にも見える
- 本番の自動デプロイ（`main` → `/var/www/shotty`）は beta に影響しない
- 検証終了後は `pm2 delete shotty-beta` と Nginx の `shotty-beta` サイト削除で撤収可能

---

*作成: 2026-08-24*

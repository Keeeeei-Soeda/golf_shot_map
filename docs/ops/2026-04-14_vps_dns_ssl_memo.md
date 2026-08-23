# 2026-04-14 VPS / DNS / SSL 作業メモ（Shotty）

このドキュメントは、`shotty.net` を ConoHa VPS（Nginx + pm2 + Next.js）で公開するまでに実施した内容をまとめた作業メモです。

---

## 前提

- **VPS**
  - IP: `160.251.213.110`
  - OS: Ubuntu 24.04
  - Web: Nginx（リバースプロキシ）
  - App: Next.js（pm2 管理、内部 `localhost:3000`）
- **ドメイン**
  - `shotty.net` / `www.shotty.net`
- **リポジトリ**
  - `Keeeeei-Soeda/golf_shot_map`
  - Next.js 本体は `shotty/` 配下

---

## 1. 「IP直打ちでページが出ない」原因と対応

### 症状

- `http://160.251.213.110` が開かない

### 原因

- **UFW で 80/443 が許可されていなかった**（22のみ ALLOW の状態）

### 対応（VPS）

```bash
ufw allow 80
ufw allow 443
ufw status
```

---

## 2. ドメイン `shotty.net` が別IPを向いていた件

### 症状

- `shotty.net` が **`150.95.255.38`** を返し、Apache のレスポンスになっていた

### 対応（お名前.com DNS）

- A レコード（ルート）: `shotty.net` → `160.251.213.110`
- A レコード（www）: `www.shotty.net` → `160.251.213.110`
- 旧 IP（`150.95.255.38`）のレコードが残っている場合は削除

### 反映確認（Mac）

```bash
nslookup shotty.net
nslookup shotty.net 8.8.8.8
nslookup shotty.net 1.1.1.1
```

権威 DNS に直接聞く場合（お名前.com の NS）：

```bash
dig @dns1.onamae.com shotty.net A +short
dig @dns2.onamae.com shotty.net A +short
```

---

## 3. SSL（HTTPS）化（Let's Encrypt + certbot）

### 目的

- `https://shotty.net` / `https://www.shotty.net` を有効化
- 更新を自動化

### 手順（VPS）

```bash
apt update
apt install -y certbot python3-certbot-nginx
```

発行・Nginx 反映：

```bash
certbot --nginx -d shotty.net -d www.shotty.net
```

自動更新の確認（ドライラン）：

```bash
certbot renew --dry-run
```

### 成功条件

- ブラウザで `https://shotty.net` が開く
- アドレスバーに鍵マーク（TLS）
- `certbot renew --dry-run` が成功する

---

## 4. Nginx / pm2 の確認コマンド

### Nginx

```bash
systemctl status nginx
nginx -t
systemctl reload nginx
ss -tlnp | grep ':80'
```

### pm2（アプリ）

```bash
pm2 status
pm2 logs shotty --lines 50
```

---

## 5. GitHub にプッシュした内容（2026-04-14）

- 追加
  - `cursor_instruction_github_features.md`
  - `cursor_setup_no_auth_pwa.md`
- 更新
  - `shotty/public/sw.js`
  - `.gitignore`（`*.pem` / `update/api.memo` を除外）

### 注意（コミットしない）

- `*.pem`（SSH 秘密鍵）
- `update/api.memo`（APIキー相当の文字列が含まれていたため）

---

## 6. 追加でやっておくと良い運用（推奨）

- **SSH のハードニング**
  - root ログイン制限（必要なら sudo ユーザー運用へ）
  - `PasswordAuthentication no`（公開鍵のみ）
  - fail2ban 導入（ブルートフォース対策）
- **監視**
  - Nginx/pm2 の死活監視
  - ディスク枯渇通知
- **バックアップ**
  - `/var/www/shotty/shotty/.env.local` の安全なバックアップ（Gitには入れない）
  - 設定ファイル（Nginx site / pm2 設定）のバックアップ

---

## 7. 未実装・追加すべき機能リスト（提案）

### アプリ（プロダクト）面

- **データ同期（サーバー保存）**
  - 現状は localStorage 依存のため、端末紛失・機種変更・複数端末で同期できない
- **アカウント/ログイン**
  - 同期を行うなら認証（メール/Apple/Google 等）が必要
- **管理/運用**
  - 利用規約 / プライバシーポリシー（位置情報・動画を扱う場合は特に重要）
  - エラーログ収集（Sentry 等）
  - 利用状況分析（匿名 analytics）
- **課金（将来）**
  - サブスク/買い切り、機能フラグ（無料/有料の差分）
- **スケール想定の整理**
  - 同時アクセス数・動画アップロード頻度・AI解析の実行頻度に応じた設計

### インフラ/セキュリティ面

- **SSH 接続性の安定化**
  - Mac の公開鍵を `~/.ssh/authorized_keys` に追加し、普段は SSH で作業できる状態にする
  - 可能なら root 直ではなく一般ユーザー + sudo 化
- **Secrets 管理**
  - APIキーは VPS の `.env.local` のみで管理（Git に載せない）
  - 漏洩疑いがあるキーはローテーション
- **バックアップ/復旧**
  - VPS 障害時の復旧手順（DNS / Nginx / pm2 / env / certbot）を 1枚にまとめる
- **監視/アラート**
  - Uptime / CPU / メモリ / ディスク / レスポンスコードの監視


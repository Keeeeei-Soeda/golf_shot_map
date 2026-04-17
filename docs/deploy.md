# デプロイ手順書（Cursor AIエージェント向け）

> ⚠️ Cursor で作業を行うエージェントは、作業開始前に必ずこのファイルを読むこと。

---

## 概要：このリポジトリの2つのデプロイ先

| デプロイ先 | URL | 内容 |
|---|---|---|
| **GitHub Pages** | `https://keeeeei-soeda.github.io/golf_shot_map/` | バニラJS版（静的サイト） |
| **ConoHa VPS** | `https://shotty.net` | Next.js版（pm2 + Nginx） |

**どちらも `git push origin main` の1コマンドで同時にデプロイされる。**

- GitHub Pages は push 後に自動で静的ファイルを公開する
- VPS は GitHub Actions が SSH で自動デプロイを実行する（`deploy.yml` 参照）

---

## ★ 通常のデプロイ手順（毎回これを実行する）

```bash
cd ~/golf_shot_map
git add .
git commit -m "変更内容のメモ"
git push origin main
```

以上で完了。反映まで1〜3分。

### デプロイ確認

| 確認先 | URL |
|---|---|
| GitHub Pages 反映確認 | `https://keeeeei-soeda.github.io/golf_shot_map/` |
| VPS 反映確認 | `https://shotty.net` |
| GitHub Actions の状態 | `https://github.com/Keeeeei-Soeda/golf_shot_map/actions` |

---

## GitHub Actions の仕組み（自動実行される内容）

`push` をトリガーに `.github/workflows/deploy.yml` が実行される。

```yaml
# .github/workflows/deploy.yml（現行の実際の内容）
script: |
  cd /var/www/shotty          # リポジトリルート（VPS上のクローン先）
  git fetch origin
  git reset --hard origin/main  # VPS側の変更を強制上書き
  cd shotty                   # Next.jsプロジェクトへ移動（必須）
  npm install
  npm run build
  pm2 restart shotty
  echo "Deployed at $(date)"
```

### VPS 接続情報

| 項目 | 値 |
|---|---|
| IP | `160.251.213.110` |
| OS | Ubuntu 24.04 LTS |
| ユーザー | `root` |
| デプロイ先 | `/var/www/shotty`（リポジトリルート） |
| Next.js本体 | `/var/www/shotty/shotty`（サブディレクトリ） |
| プロセス管理 | pm2（プロセス名: `shotty`） |
| Webサーバー | Nginx（ポート80/443 → localhost:3000 へプロキシ） |
| ドメイン | `shotty.net` |

GitHub Actions の Secrets（`Settings > Secrets > Actions`）:

| シークレット名 | 内容 |
|---|---|
| `VPS_HOST` | `160.251.213.110` |
| `VPS_USER` | `root` |
| `VPS_KEY` | SSH秘密鍵（`-----BEGIN`から`-----END`まで全部） |

---

## コースデータを編集した場合の注意

このリポジトリにはコースデータが **2箇所** ある。

| ファイル | 対象 |
|---|---|
| `/courses.js`（リポジトリルート） | バニラJS版（GitHub Pages） |
| `/shotty/src/data/courses.ts` | Next.js版（shotty.net） |

**コースを追加・変更したときは両方のファイルを更新すること。**

---

## VPS に直接 SSH する場合（手動確認・トラブル対応）

```bash
# ローカルのターミナルで実行
ssh root@160.251.213.110
```

SSH 鍵は `shotty_golf.pem`（リポジトリ内、`.gitignore` 対象）を使う場合:

```bash
chmod 600 shotty_golf.pem
ssh -i shotty_golf.pem root@160.251.213.110
```

### VPS上でよく使うコマンド

```bash
pm2 status                        # アプリの稼働状態確認
pm2 logs shotty --lines 50        # ログ確認
pm2 restart shotty                # アプリ再起動

nginx -t                          # Nginx設定の構文チェック
systemctl reload nginx            # Nginx再読み込み

# 手動デプロイ（GitHub Actions が失敗した場合）
cd /var/www/shotty
git fetch origin
git reset --hard origin/main
cd shotty
npm install
npm run build
pm2 restart shotty
```

---

## トラブルシューティング

### GitHub Actions が失敗する

1. `https://github.com/Keeeeei-Soeda/golf_shot_map/actions` でエラーログを確認
2. Secrets が正しく設定されているか確認
3. VPS に SSH して手動デプロイ（上記「手動デプロイ」参照）

### ビルドがメモリ不足で失敗する

```bash
cd /var/www/shotty/shotty
export NODE_OPTIONS="--max-old-space-size=512"
npm run build
pm2 restart shotty
```

### pm2 が止まっている

```bash
cd /var/www/shotty/shotty
pm2 start ecosystem.config.js
pm2 save
```

---

## ⚠️ 禁止事項

- `.env.local` を Git にコミットしない（`.gitignore` 対象）
- `shotty_golf.pem`（秘密鍵）を Git にコミットしない（`.gitignore` 対象）
- 秘密鍵をチャットに貼り付けない

---

*最終更新: 2026-04-17*

# Cursor 指示書：shotty.net への Stripe Checkout 実装

## 前提・環境情報

- **プロジェクト**: Next.js (App Router)
- **本番URL**: `https://shotty.net`
- **決済ライブラリ**: Stripe
- **環境変数ファイル**: `.env.local`（既にキー設定済み）

---

## ステップ 0：ライブラリのインストール（ターミナルで実行）

```bash
npm install stripe @stripe/stripe-js
```

---

## ステップ 1：`.env.local` の確認・設定

以下の3つの環境変数が `.env.local` に記載されていることを確認してください。

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> `STRIPE_WEBHOOK_SECRET` は後ほど Stripe CLI または Stripe ダッシュボードから取得します。今はひとまず空欄でも構いません。

---

## ステップ 2：Cursor へのプロンプト（そのままコピーして貼り付け）

---

```
Next.js (App Router) プロジェクトに Stripe Checkout を導入します。
以下の 3 つのファイルを新規作成・修正してください。

---

### 1. Checkout API（`app/api/checkout/route.ts`）

- Stripe の Checkout Session を作成する **POST エンドポイント**
- `stripe` パッケージをサーバーサイドで使用し、`STRIPE_SECRET_KEY` を参照すること
- リクエストボディから `priceId`（または `amount` と `productName`）を受け取る構成にすること
- セッション作成時のオプション：
  - `mode: "payment"`
  - `success_url`: `https://shotty.net/success`
  - `cancel_url`: `https://shotty.net/cancel`
- 作成した `session.url` を JSON レスポンスで返すこと

---

### 2. 決済ボタンコンポーネント（`components/CheckoutButton.tsx`）

- `"use client"` ディレクティブを先頭に記載すること
- `@stripe/stripe-js` の `loadStripe` を使用
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` で Stripe を初期化
- ボタンクリック時に `/api/checkout` へ POST リクエストを送信し、
  レスポンスの `url` へ `window.location.href` でリダイレクトする
- ローディング状態（`isLoading`）を管理し、処理中はボタンを非活性にすること
- エラー時はコンソールにログを出力すること

---

### 3. Webhook ハンドラー（`app/api/webhook/route.ts`）

- Stripe からの POST リクエストを受け取るエンドポイント
- `stripe.webhooks.constructEvent` で署名検証を行うこと
  - 署名キーは `STRIPE_WEBHOOK_SECRET` を使用
  - リクエストボディは `raw buffer` で取得すること（`request.text()` を使用）
- `checkout.session.completed` イベントを処理すること
  - 処理内容：コンソールに `"✅ 決済完了:" + session.id` をログ出力
  - （将来的なDB更新のためのダミー関数 `updateDatabase(session)` も定義しておく）
- 署名検証失敗時は `400` を返すこと
- 正常処理時は `{ received: true }` を返すこと

---

### 前提条件・制約

- 環境変数は `STRIPE_SECRET_KEY`・`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`・`STRIPE_WEBHOOK_SECRET` を使用
- TypeScript で記述すること
- `stripe` の初期化はモジュールレベルで行い、リクエストのたびに再生成しないこと
- App Router の規約（`export async function POST`）に従うこと
```

---

## ステップ 3：動作確認手順

### ローカルテスト

```bash
# 開発サーバー起動
npm run dev

# 別ターミナルで Stripe CLI をインストール後、Webhook をローカルに転送
stripe listen --forward-to localhost:3000/api/webhook
```

> `stripe listen` 実行後に表示される `whsec_...` をコピーして `.env.local` の `STRIPE_WEBHOOK_SECRET` に貼り付け、サーバーを再起動してください。

### 決済フローの確認

1. `CheckoutButton` をページに配置して `npm run dev` で起動
2. ボタンをクリック → Stripe のテスト決済画面へ遷移することを確認
3. テストカード番号 `4242 4242 4242 4242`（有効期限・CVC は任意）で決済
4. `https://shotty.net/success` へリダイレクトされることを確認
5. ターミナルに `✅ 決済完了: cs_test_...` のログが出ることを確認

---

## ステップ 4：VPS へのデプロイ

```bash
# コードをプッシュ（自動デプロイが走る）
git add .
git commit -m "feat: Stripe Checkout 実装"
git push origin main
```

**デプロイ後に VPS 側でも環境変数を設定すること：**

```env
STRIPE_SECRET_KEY=sk_test_（または sk_live_...）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_（または pk_live_...）
STRIPE_WEBHOOK_SECRET=whsec_...（Stripe ダッシュボードの Webhook エンドポイントから取得）
```

> 本番用の Webhook は Stripe ダッシュボード → 「Webhooks」→「エンドポイントを追加」→ URL: `https://shotty.net/api/webhook` で登録し、`checkout.session.completed` を選択してください。

---

## 実装後の拡張ポイント（次のステップ候補）

| 項目 | 概要 |
|------|------|
| サブスクリプション対応 | `mode: "subscription"` に変更し、`priceId` を月額プランに |
| 決済完了ページ作成 | `app/success/page.tsx` に感謝メッセージ＋セッション情報表示 |
| DB 連携 | Webhook の `updateDatabase()` に実際の処理（Prisma / Supabase 等）を実装 |
| カスタマーポータル | Stripe の Customer Portal で請求管理をユーザーに開放 |

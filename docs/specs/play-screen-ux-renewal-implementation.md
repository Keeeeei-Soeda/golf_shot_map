# プレー画面 UXリニューアル — 実装まとめ

**最終更新：2026年8月24日**  
**ブランチ：** `feature/play-screen-ux-renewal`  
**検証URL：** https://beta.shotty.net（本番 https://shotty.net は現行UIのまま並行稼働）

関連ドキュメント：

- 調査書：[`docs/codebase-survey.md`](../codebase-survey.md)
- ナビ棚卸し：[`docs/nav-inventory.md`](../nav-inventory.md)
- beta 運用：[`docs/ops/beta-shotty-net.md`](../ops/beta-shotty-net.md)

---

## 1. 目的

SHOTTY caddy のプレー画面を、「測定」と「記録」を**モード切替なし**で行えるUIに再構築した。  
スコア計算・保存・DBは既存流用とし、UI/UX層を中心に変更している。

---

## 2. 画面構成（現状）

### 2-1. 基本レイアウト

| 位置 | 要素 | 内容 |
|------|------|------|
| 上部左 | ハンバーガー | コース設定ドロワー |
| 上部中央 | ロゴ | SHOTTY caddy |
| 上部右 | **⊞ ランチャー** ＋ サインイン／アバター | 低頻度機能を集約 |
| 左上 | DistanceCard | 現在地→基準ピンの残り距離（`-- yd`／タップでGPS） |
| 右サイド | SideActions（4ボタン） | 記録・パット・測定・地図回転 |
| 下部 | HoleBar | ◀ / `H n` `PAR n` `◯◯ yd` / ▶ |
| マップ | 全画面 | タップ＝測距、長押し＝地点記録 |

### 2-2. 右サイドレール（高頻度）

| 順 | ラベル | 見た目 | 動作 |
|----|--------|--------|------|
| 1 | 現在地で記録 | 緑塗り `#1F9E52` ＋白ピンアイコン | GPS → ショットパネル |
| 2 | パット数記録 | 金塗り `#E0A51F` ＋黒パター | カップパネル |
| 3 | ヤード測定 | スレート `#414C58` ＋定規 | T→C 測距表示 |
| 4 | 地図回転 | 枠線スタイル ＋ 🧭 | `rotateToHole()` |

アイコン実体：`shotty/public/icons/icon-{pin,putter,ruler}.png`（60px @2x、占有率約72%に前処理済み）

### 2-3. 機能ランチャー（ラウンド中・低頻度）

定義：`shotty/src/lib/launcher-items.ts`（仮絵文字。後から `iconSrc` で差し替え可）

| タイル | 動作 |
|--------|------|
| スコアカード | `openScorecard()` |
| ラウンド履歴 | `openHistory()` |
| GPS追尾 | `onGpsBtn()` |
| クラブセット | `openClubEditor()`（**メニューからは撤去・ランチャーのみ**） |
| ショット履歴 | `toggleReview()` |
| ホール消去 | 確認後 `clearHoleShots()`（当該ホールのショット全削除） |

開閉：⊞ トグル／バックドロップ／Esc／タイル選択で閉じる。

### 2-4. 下部バーのヤード

- **同一行：** `H{n}` / `PAR {n}` / `{yd} yd`
- **未ショット時：** 選択ティーの公式ヤード  
  - レギュラー → `yards.reg`  
  - レディース → `yards.ladies`
- **ショット後：** 打点 → センターの実測ヤード
- **出さないもの：** F／B への距離、マップ上の旧ヤードパネル

### 2-5. マップ操作ルール

| 操作 | 結果 |
|------|------|
| 短いタップ | 測距のみ（吹き出し：から ◯yd／⛳まで ◯yd） |
| 長押し（約0.55秒） | その地点でショットパネル |
| ピン F/C/B タップ | 測距基準の切替 |
| 右サイド／ランチャー | 記録・測定など |

**廃止したもの**

- 測定モード／記録モード切替UI
- マップ上の方位磁石＋「T」ボタン（`#mapBtns` は非表示のまま互換用に残置）
- 上部の 📍📊📋 個別アイコン（ランチャーへ移設）

---

## 3. 主要パネル

### 3-1. ショット登録（全画面）

- GPS／長押しで打点確定 → クラブ＋打感
- ペナルティ・OBは**常時表示**
- パネル内にレビュー（📋）・クリア（↺）
- 打点からの距離を上段に表示

### 3-2. パット・スコア

- パット 1–4 ＋ **5+**
- 常時押下可能（ショット未記録でも単独確定可）
- ショット0件時はスコア手選択必須（誤って1打保存される経路を遮断）
- 確定後サマリー →「次のホールへ」

---

## 4. 並行検証環境（beta）

| 項目 | 内容 |
|------|------|
| URL | https://beta.shotty.net |
| プロセス | pm2 `shotty-beta` / port **3001** |
| コード | `/var/www/shotty-beta`（feature 同期） |
| DB | **本番と共有**（`NEXTAUTH_URL` のみ beta） |
| 本番 | `shotty` / 3000 / `/var/www/shotty`（`main`） |

詳細手順は `docs/ops/beta-shotty-net.md`。

Maps リファラーに `https://beta.shotty.net/*` を追加済み想定。

---

## 5. 主な変更ファイル

| パス | 役割 |
|------|------|
| `shotty/src/components/map/SideActions.tsx` | 右レール4ボタン |
| `shotty/src/components/map/DistanceCard.tsx` | 左上残り距離 |
| `shotty/src/components/map/HoleBar.tsx` | 下部ホール＋ヤード |
| `shotty/src/components/map/ShotPanel.tsx` | ショット全画面 |
| `shotty/src/components/map/CupPanel.tsx` | パット・スコア |
| `shotty/src/components/map/YardageBar.tsx` | 旧マップボタン用プレースホルダ |
| `shotty/src/components/layout/Header.tsx` | ⊞＋認証のみ |
| `shotty/src/components/layout/FeatureLauncher.tsx` | ランチャーUI |
| `shotty/src/lib/launcher-items.ts` | ランチャー項目定義 |
| `shotty/src/app/golf/logic.ts` | 測距・長押し・ヤード更新などUI操作 |
| `shotty/src/app/globals.css` | 新UIスタイル |
| `shotty/public/icons/icon-*.png` | レール用シルエット |

**原則無改変：** `confirmShot` / `confirmCupIn` / `saveRound` の計算・保存本体（ガード追加のみ可）

---

## 6. 実装ステップ履歴（要約）

1. 基本レイアウト（マップ全画面・DistanceCard・HoleBar）
2. 右サイド正円ボタン
3. タップ測距吹き出し・誤発火防止
4. ショットパネル再構成（ペナルティ常時表示）
5. パットパネル（5+・1打バグ修正）
6. 長押し記録＋GPS失敗時案内
7. ピン／ティー等のマップアイコン調整
8. レール用シルエットアイコン＋塗り背景
9. 機能ランチャー＋クラブセット移設＋地図回転
10. マップ上方位磁石/T廃止 → 下部バーヤード（レディース公式対応）

---

## 7. 残タスク・注意

- [ ] beta での実機確認完了後、`main` へマージ → 本番反映
- [ ] ランチャー仮絵文字 → ChatGPT 製シルエットへの差し替え（`iconSrc`）
- [ ] feature ブランチの GitHub push（権限設定が必要な場合あり）
- [ ] 検証終了後、不要なら `shotty-beta` の撤収

**注意**

- beta と本番は DB 共有のため、検証データが本番アカウントに残る
- Cookie はホスト別 → beta では別途サインインが必要
- VPS メモリ約1GBのため、beta ビルド中は一時的に本番を止める運用あり

---

## 8. ローカル確認

```bash
cd shotty
npm run dev   # 例: http://localhost:3001
```

GPS は Cursor 内蔵ブラウザ不可 → **Chrome** 推奨。

---

*本ドキュメントは 2026-08-24 時点の `feature/play-screen-ux-renewal` 実装内容の要約である。*

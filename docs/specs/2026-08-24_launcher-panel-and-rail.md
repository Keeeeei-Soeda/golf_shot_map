# ランチャー確定・右レール整理・関連修正（2026-08-24）

**ブランチ：** `feature/play-screen-ux-renewal`  
**検証：** ローカル `http://localhost:3001` ／ beta `https://beta.shotty.net`

関連：

- 実装全体まとめ：[`play-screen-ux-renewal-implementation.md`](./play-screen-ux-renewal-implementation.md)
- beta 運用：[`../ops/beta-shotty-net.md`](../ops/beta-shotty-net.md)

---

## 1. 概要

この更新では、機能ランチャーの並び・危険操作の分離、右レールのグループ化と色分けを確定仕様どおりに実装した。あわせて、長押し記録の「登録する」が進まない不具合と、ティー種別選択前にサイドUIが出る問題を修正した。

---

## 2. ランチャーパネル（確定仕様）

定義の単一ソース：`shotty/src/lib/launcher-items.ts`（`LAUNCHER_GROUPS`）

### 並び（グループ見出し付き）

| グループ | 項目 |
|----------|------|
| 記録を見る | スコアカード → ショット履歴 → ラウンド履歴 |
| 調整 | クラブセット → GPS追尾 |
| （仕切り線） | ホール消去 |

### ホール消去（安全対策）

- 他タイルと仕切り線で分離
- 赤系下地 `#3A1F1F` / ラベル `#E08A8A`
- タップ時に確認ダイアログ：「このホールの記録を消去しますか？」
- 確認なしでは消去しない（ロジック本体 `clearHoleShots` は変更なし）

### アイコン

- 仮アイコン（絵文字）のまま。`icon` / `iconSrc` を同ファイルで管理し、後から一括差し替え可能

---

## 3. 右レール（SideActions）

### グループ構成

1. **アクション群：** 現在地で記録 → パット数記録 → ヤード測定  
2. **区切り（破線）**  
3. **マップ操作：** 地図回転

### 色（仕様どおり）

| ボタン | 背景 | リング | アイコン色 |
|--------|------|--------|-----------|
| 現在地で記録 | `#1F9E52` | `#6FE0A0` | `#FFFFFF` |
| パット数記録 | `#E0A51F` | `#F5CF6A` | `#3A2A02` |
| ヤード測定 | `#414C58` | `#6A7784` | `#CDD6E0` |
| 地図回転 | `#274A52` | `#5AA6B0` | `#BFE6EC` |

各機能のロジックは既存流用（入口の配置・見せ方のみ変更）。

---

## 4. バグ修正

### 4-1. 長押し記録 →「登録する」が進まない

**原因：** ShotPanel の「登録する」が React の `disabled` 固定で、再描画のたびに無効に戻っていた。

**対応：**

- クラブ選択（`.cb.sel`）に連動して `canSubmit` を同期
- 長押し座標を安定した `LatLng` にコピー（`toStableLatLng` / `latOf` / `lngOf`）

### 4-2. ティー種別選択画面でサイドボタン等が出る

**原因：** コース選択直後に `hasData` が true になるが、マップはまだ `emptyMap`（ティー選択）のまま。

**対応：** `isMapPlayActive()`（`#map` が表示中）を追加し、以下はマップ表示後のみ出す。

- SideActions（右レール）
- DistanceCard
- HoleBar

---

## 5. 主な変更ファイル

| ファイル | 内容 |
|----------|------|
| `shotty/src/lib/launcher-items.ts` | グループ定義・確定順 |
| `shotty/src/components/layout/FeatureLauncher.tsx` | 見出し・区切り・確認文言 |
| `shotty/src/components/map/SideActions.tsx` | 2グループ＋区切り |
| `shotty/src/components/map/ShotPanel.tsx` | 登録ボタン有効化の同期 |
| `shotty/src/components/map/DistanceCard.tsx` / `HoleBar.tsx` | マップ表示後のみ |
| `shotty/src/app/golf/logic.ts` | LatLng 正規化、`isMapPlayActive` |
| `shotty/src/app/globals.css` | ランチャー危険色・レール色・区切り |
| `docs/ops/beta-shotty-net.md` / `deploy.md` | beta 並行稼働の記載 |

---

## 6. 確認チェックリスト

- [x] ランチャーが確定順で表示される
- [x] 「記録を見る」3項目が連続1グループ
- [x] ホール消去が区切られ赤系＋確認ダイアログ
- [x] 右レールがアクション／地図回転の2グループ
- [x] 測定と地図回転が色で区別できる
- [x] ティー選択前はサイドUI非表示、選択後に表示
- [x] 長押し → クラブ → 登録する、が進む

---

## 7. 残課題（任意）

- ランチャー通知バッジ「1」の意味づけ（項目側へ寄せる等）
- 最終シルエットアイコンへの一括差し替え
- `feature/play-screen-ux-renewal` → `main` マージと本番切替

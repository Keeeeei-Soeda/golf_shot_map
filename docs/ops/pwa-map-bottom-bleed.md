# PWA マップ下部フルブリード — 戻し方

**目的:** 黒帯を消し、マップを画面最下端まで描画。操作バーはホームバーの上。

## いま有効なスイッチ

`shotty/src/app/layout.tsx` の `<body className="… map-bottom-bleed">`

## 無効化（すぐ戻す）

どれか1つでOK。

1. **クラスを外す（推奨・一番簡単）**  
   `layout.tsx` の `map-bottom-bleed` を削除してデプロイ。  
   → 下部バーは再びフロー内配置に戻る（マップはバーの上まで）。

2. **CSSブロックを無効化**  
   `globals.css` 内の `PWA_MAP_BOTTOM_BLEED` 〜 `end` をコメントアウト。

3. **git**  
   ```bash
   git log --oneline -- grep -i bleed
   git revert <commit>
   ```

## 関連ファイル

- `shotty/src/app/layout.tsx` — body クラス
- `shotty/src/app/globals.css` — `PWA_MAP_BOTTOM_BLEED` ブロック / `--bottom-bar-offset`

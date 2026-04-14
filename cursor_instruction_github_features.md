# Cursor 実装指示書 — GitHub版 新機能追加

> 対象リポジトリ: `github.com/Keeeeei-Soeda/golf_shot_map`  
> 対象ファイル: `app/shot.js`, `index.html`, `style.css`  
> 作業前に必ずローカルで動作確認すること

---

## 背景・前提知識

現行アプリは vanilla JS + Google Maps API で動作する静的サイト。
データは `localStorage` の `golfRounds` キーに以下の構造で保存されている。

```js
// 1ラウンドのデータ構造
{
  id: string,
  date: string,           // "2026/4/12"
  gcName: string,         // "ローズゴルフクラブ"
  courseName: string,     // "アウト"
  updatedAt: number,      // Date.now()
  shots: {
    // ショット配列 (key例: "0_0_2")
    "gcIdx_cIdx_hIdx": [
      {
        no: number,          // 打順
        lat: number,
        lng: number,
        club: string,        // "7I"
        carry: number,       // 飛距離yd
        remaining: number,   // 残り距離yd
        fromLabel: string    // "ティー" or "2打目地点"
      }
    ],
    // ホールメタ (key例: "0_0_2_meta")
    "gcIdx_cIdx_hIdx_meta": {
      cupIn: true,
      scoreDiff: number,   // パーとの差（ボギー=1）
      par: number,         // そのホールのpar
      totalShots: number   // 合計打数
    }
  }
}
```

---

## 実装タスク一覧

| # | タスク | 対象ファイル | 優先度 |
|---|---|---|---|
| 1 | ショット評価タグの追加 | `app/shot.js`, `index.html`, `style.css` | 高 |
| 2 | OB・ペナルティ機能の追加 | `app/shot.js`, `index.html`, `style.css` | 高 |
| 3 | パット数記録の追加 | `app/shot.js`, `index.html`, `style.css` | 高 |
| 4 | Prismaスキーマの漏れ修正 | 要件定義書のメモ（Next.js移行時に反映） | 中 |

---

## タスク 1: ショット評価タグの追加

### 概要

ショット登録パネル（`shotPanel`）にショット評価タグボタンを追加する。
タグは任意選択（選択なしでも登録可能）で、複数選択可。

### 評価タグ定義

```js
const EVAL_TAGS = [
  { key: 'nice',   label: '👍 ナイス'  },
  { key: 'miss',   label: '😤 ミス'    },
  { key: 'duff',   label: '⛏ ダフり'  },
  { key: 'slice',  label: '↗ スライス' },
  { key: 'hook',   label: '↙ フック'   },
];
```

### index.html の変更

`spBodyRecord` 内、クラブグリッド（`#clubGrid`）と登録ボタン（`.sp-btns`）の間に評価タグエリアを追加する：

```html
<!-- ショット評価タグ（任意） -->
<div class="sp-eval-label">評価（任意）</div>
<div class="sp-eval-row" id="evalRow">
  <button class="eval-btn" data-key="nice"  onclick="toggleEval('nice')">👍 ナイス</button>
  <button class="eval-btn" data-key="miss"  onclick="toggleEval('miss')">😤 ミス</button>
  <button class="eval-btn" data-key="duff"  onclick="toggleEval('duff')">⛏ ダフり</button>
  <button class="eval-btn" data-key="slice" onclick="toggleEval('slice')">↗ スライス</button>
  <button class="eval-btn" data-key="hook"  onclick="toggleEval('hook')">↙ フック</button>
</div>
```

### app/shot.js の変更

**① グローバル変数に追加**（`selectedClub` の近く）：
```js
let selectedEvals = []; // 選択中の評価タグ
```

**② `toggleEval()` 関数を追加**：
```js
function toggleEval(key) {
  const idx = selectedEvals.indexOf(key);
  if (idx >= 0) {
    selectedEvals.splice(idx, 1);
  } else {
    selectedEvals.push(key);
  }
  document.querySelectorAll('.eval-btn').forEach(b => {
    b.classList.toggle('sel', selectedEvals.includes(b.dataset.key));
  });
}
```

**③ `openShotPanelUI()` にリセット処理を追加**：
```js
// 既存の selectedClub = null; の下に追加
selectedEvals = [];
document.querySelectorAll('.eval-btn').forEach(b => b.classList.remove('sel'));
```

**④ `confirmShot()` の `shots.push(...)` に `evaluation` を追加**：
```js
shots.push({
  no,
  lat: pendingPos.lat(),
  lng: pendingPos.lng(),
  club: selectedClub,
  carry: carryYd,
  remaining: remYd,
  fromLabel: prevIsTee ? 'ティー' : `${shots.length}打目地点`,
  evaluation: [...selectedEvals]   // ← 追加
});
```

**⑤ `openReview()` のショット表示に評価タグを追加**：

既存の `rv-line` divの後に以下を追加：
```js
const evalHtml = s.evaluation && s.evaluation.length
  ? '<div class="rv-evals">' +
    s.evaluation.map(k => {
      const t = EVAL_TAGS.find(e => e.key === k);
      return t ? '<span class="rv-eval-tag">' + t.label + '</span>' : '';
    }).join('') +
    '</div>'
  : '';
```

**⑥ ホールサマリーの `shotRows` にも評価タグを追加**：

`openHoleSummary()` 内の `shotRows` のマップ処理に以下を追加：
```js
const evalBadges = s.evaluation && s.evaluation.length
  ? s.evaluation.map(k => {
      const t = EVAL_TAGS.find(e => e.key === k);
      return t ? `<span class="hs-eval-tag">${t.label}</span>` : '';
    }).join('')
  : '';
```

### style.css の変更

```css
/* 評価タグ */
.sp-eval-label {
  font-size: 10px;
  color: var(--gr);
  margin: 8px 0 5px;
  letter-spacing: 1px;
}
.sp-eval-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}
.eval-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--g3);
  background: rgba(255,255,255,0.04);
  color: var(--gr);
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
  transition: all .15s;
}
.eval-btn.sel {
  border-color: var(--acc);
  background: rgba(232,200,74,0.15);
  color: var(--acc);
}
/* レビュー・サマリーの評価タグ */
.rv-evals, .hs-eval-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.rv-eval-tag, .hs-eval-tag {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(232,200,74,0.12);
  color: var(--acc);
  border: 1px solid rgba(232,200,74,0.3);
}
```

---

## タスク 2: OB・ペナルティ機能の追加

### 概要

カップインパネル（`cupPanel`）にOB・ペナルティの打数指定UIを追加する。
「通常打順」がデフォルトで、OBや池に入った場合に「プレ3/4/5」を選択できる。

### 仕様

| 選択 | 意味 | 動作 |
|---|---|---|
| 通常（デフォルト） | ペナルティなし | 現行通り |
| プレ3 | 打直し or 前進4 | 3打目からカウント再開 |
| プレ4 | 2打のペナルティ | 4打目からカウント再開 |
| プレ5 | 3打のペナルティ | 5打目からカウント再開 |

### index.html の変更

`cupPanel` 内、`.cup-score-area` の前に追加：

```html
<!-- OB・ペナルティ選択 -->
<div class="cup-penalty-area">
  <div class="cup-penalty-label">通常打順（ペナルティなし）</div>
  <div class="cup-penalty-btns">
    <button class="penalty-btn sel" data-from="0" onclick="selectPenalty(this, 0)">
      通常
    </button>
    <button class="penalty-btn" data-from="3" onclick="selectPenalty(this, 3)">
      プレ3<br><small>3打目から</small>
    </button>
    <button class="penalty-btn" data-from="4" onclick="selectPenalty(this, 4)">
      プレ4<br><small>4打目から</small>
    </button>
    <button class="penalty-btn" data-from="5" onclick="selectPenalty(this, 5)">
      プレ5<br><small>5打目から</small>
    </button>
  </div>
</div>
```

### app/shot.js の変更

**① グローバル変数に追加**：
```js
let cpPenaltyFrom = 0; // 0=通常, 3/4/5=プレN
```

**② `selectPenalty()` 関数を追加**：
```js
function selectPenalty(btn, from) {
  cpPenaltyFrom = from;
  document.querySelectorAll('.penalty-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  // ペナルティに応じてスコア表示を更新
  const h = hole(); if (!h) return;
  const shots = curShots();
  // ペナルティ後の打数 = max(記録打数+1, プレN打数)
  const base = from > 0
    ? Math.max(shots.length + 1, from)
    : shots.length + 1;
  const diff = base - h.par;
  cpSelectedDiff = diff;
  document.getElementById('cpShots').textContent = base;
  const sd = scoreDef(diff);
  const lbl = document.getElementById('cpScoreLabel');
  lbl.textContent = `${sd.name}（${diff > 0 ? '+' : ''}${diff}）`;
  lbl.className = `cup-score-label ${sd.cls}`;
  // スコアボタンの選択状態も更新
  document.querySelectorAll('.score-btn').forEach(b => {
    const d = parseInt(b.getAttribute('onclick').match(/-?\d+/)[0]);
    b.classList.toggle('sel', d === diff);
  });
}
```

**③ `openCupPanel()` にリセット処理を追加**：
```js
// 既存コードの冒頭に追加
cpPenaltyFrom = 0;
document.querySelectorAll('.penalty-btn').forEach(b => {
  b.classList.toggle('sel', b.dataset.from === '0');
});
```

**④ `confirmCupIn()` の保存データに `penalty` を追加**：
```js
roundShots[`${key}_meta`] = {
  cupIn: true,
  scoreDiff: cpSelectedDiff,
  par: h.par,
  totalShots,
  penaltyFrom: cpPenaltyFrom > 0 ? cpPenaltyFrom : null   // ← 追加
};
```

### style.css の変更

```css
/* ペナルティ選択エリア */
.cup-penalty-area {
  padding: 10px 16px 0;
}
.cup-penalty-label {
  font-size: 10px;
  color: var(--gr);
  margin-bottom: 6px;
  letter-spacing: 1px;
}
.cup-penalty-btns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}
.penalty-btn {
  padding: 6px 4px;
  border-radius: 8px;
  border: 1px solid var(--g3);
  background: rgba(255,255,255,0.04);
  color: var(--gr);
  font-size: 10px;
  line-height: 1.3;
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  transition: all .15s;
}
.penalty-btn small {
  font-size: 9px;
  opacity: 0.7;
}
.penalty-btn.sel {
  border-color: var(--red);
  background: rgba(224,82,82,0.15);
  color: var(--red);
}
```

---

## タスク 3: パット数記録の追加

### 概要

カップインパネル（`cupPanel`）にパット数入力UIを追加する。
1〜4パットを選択できるボタン式。任意入力（選択なしも可）。

### index.html の変更

`cupPanel` 内、`.cup-btns`（確定・キャンセルボタン）の直前に追加：

```html
<!-- パット数 -->
<div class="cup-putts-area">
  <div class="cup-putts-label">パット数（任意）</div>
  <div class="cup-putts-btns" id="cpPuttsBtns">
    <button class="putts-btn" data-putts="1" onclick="selectPutts(this, 1)">1パット</button>
    <button class="putts-btn" data-putts="2" onclick="selectPutts(this, 2)">2パット</button>
    <button class="putts-btn" data-putts="3" onclick="selectPutts(this, 3)">3パット</button>
    <button class="putts-btn" data-putts="4" onclick="selectPutts(this, 4)">4パット</button>
  </div>
</div>
```

### app/shot.js の変更

**① グローバル変数に追加**：
```js
let cpPutts = null; // null=未選択
```

**② `selectPutts()` 関数を追加**：
```js
function selectPutts(btn, n) {
  // 同じボタンを再タップで解除
  if (cpPutts === n) {
    cpPutts = null;
    document.querySelectorAll('.putts-btn').forEach(b => b.classList.remove('sel'));
  } else {
    cpPutts = n;
    document.querySelectorAll('.putts-btn').forEach(b => {
      b.classList.toggle('sel', parseInt(b.dataset.putts) === n);
    });
  }
}
```

**③ `openCupPanel()` にリセット処理を追加**：
```js
cpPutts = null;
document.querySelectorAll('.putts-btn').forEach(b => b.classList.remove('sel'));
```

**④ `confirmCupIn()` の保存データに `putts` を追加**：
```js
roundShots[`${key}_meta`] = {
  cupIn: true,
  scoreDiff: cpSelectedDiff,
  par: h.par,
  totalShots,
  penaltyFrom: cpPenaltyFrom > 0 ? cpPenaltyFrom : null,
  putts: cpPutts   // ← 追加
};
```

**⑤ `openHoleSummary()` にパット数表示を追加**：

`hsHoleInfo` のテキスト生成部分を以下に更新：
```js
const puttsText = meta.putts ? `　${meta.putts}パット` : '';
document.getElementById('hsHoleInfo').textContent =
  `H${h.no} PAR${h.par}　${totalShots}打${puttsText}`;
```

**⑥ `buildScoreCard()` にパット数表示を追加**：

スコアセルの `return` 部分に以下を追加：
```js
const puttsLabel = meta.putts ? `<div class="sc-putts">${meta.putts}パット</div>` : '';
return `<td class="sc-cell ${sd.cls}">${s}<br><small>${label}</small>${puttsLabel}</td>`;
```

### style.css の変更

```css
/* パット数選択エリア */
.cup-putts-area {
  padding: 0 16px 10px;
}
.cup-putts-label {
  font-size: 10px;
  color: var(--gr);
  margin-bottom: 6px;
  letter-spacing: 1px;
}
.cup-putts-btns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}
.putts-btn {
  padding: 7px 4px;
  border-radius: 8px;
  border: 1px solid var(--g3);
  background: rgba(255,255,255,0.04);
  color: var(--gr);
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
  transition: all .15s;
}
.putts-btn.sel {
  border-color: var(--blue);
  background: rgba(74,159,212,0.15);
  color: var(--blue);
}
/* スコアカードのパット数 */
.sc-putts {
  font-size: 9px;
  opacity: 0.7;
  margin-top: 1px;
}
```

---

## タスク 4: データ構造の確認メモ（Next.js移行時に反映）

現行アプリで既に保存されているが、要件定義書のPrismaスキーマに未定義だったデータ。
**Next.js移行時に以下をPrismaスキーマへ追加すること。**

### `Shot` モデルへの追加

```prisma
fromLabel  String?   // "ティー" | "2打目地点" など
```

### `Round` モデルへの追加

```prisma
updatedAt  DateTime  @updatedAt  // 最終更新時刻
```

### `HoleScore` モデルへの追加

```prisma
par        Int       // そのホールのPAR（スコア計算に使用）
putts      Int?      // パット数（タスク3で追加）
penaltyFrom Int?     // プレN打数（タスク2で追加、null=通常）
```

### `Course` モデルへの追加

```prisma
gcid       Int?      // ゴルフ場ID（courses.jsから移行）
cid        Int?      // コースID（courses.jsから移行）
```

※ ShotNaviリンクは不要なため、gcid/cidはコース識別用途のみとする。

---

## 実装後の動作確認チェックリスト

```
ショット評価タグ
□ ショット登録パネルに評価タグボタンが表示される
□ 複数タグを同時選択できる
□ 同じタグを再タップで解除できる
□ 登録後にshotsデータにevaluationが保存されている
□ ホールサマリーに評価タグが表示される
□ レビューパネルに評価タグが表示される
□ パネルを再度開いた時にタグがリセットされている

OB・ペナルティ
□ カップインパネルにペナルティ選択が表示される
□ デフォルトは「通常」が選択されている
□ プレ3選択でスコアが自動更新される
□ プレ4/5も同様に動作する
□ 確定後メタデータにpenaltyFromが保存されている
□ パネルを再度開いた時に通常にリセットされている

パット数
□ カップインパネルにパット数ボタンが表示される
□ 1〜4パットを選択できる
□ 同じボタン再タップで選択解除できる
□ ホールサマリーにパット数が表示される
□ スコアカードにパット数が表示される
□ 確定後メタデータにputtsが保存されている
```

---

## 注意事項

- **Safari/WebKit** では `const` を使ったテンプレートリテラルのネストに注意。文字列連結で書くこと
- **既存データとの互換性**: `evaluation`, `penaltyFrom`, `putts` は全て optional なので、既存のlocalStorageデータは壊れない
- **`sidebar.js`** は `./app/` にコピーすること（ルートではなく）
- デプロイ前に必ず `git fetch origin` + `git rebase origin/main` を実行すること

---

*cursor_instruction_github_features.md — Shotty実装指示書*

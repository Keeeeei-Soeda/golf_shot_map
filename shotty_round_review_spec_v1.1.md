# Shotty ラウンド振り返り画面 実装指示書 v1.1

> このドキュメントは Cursor 向けの実装指示書です。
>
> **作業ポリシー（重要）**
> - GitHub リポジトリ `Keeeeei-Soeda/golf_shot_map` の **最新ファイルを真実のソース** として扱うこと
> - 本ドキュメントと最新コードに差分があった場合は、**作業を中断せず最新コードに合わせて実装を継続** すること
> - 実装中に発見した差分や疑問点は **完了後にまとめてバッチ報告** すること。途中で質問しないこと
>
> **v1.1 の変更点（v1.0 → v1.1）**
> - ショット結果のタグを **2系統に分離**（特性 / 打感）
> - **OB は独立フィールド** に変更（`isOB: boolean`）
> - **クラブ別平均飛距離** のコード一式を拡充

---

## 0. 前提環境

- Next.js 14 (App Router) + TypeScript
- Prisma v7（`@prisma/adapter-pg` ドライバアダプタ）+ PostgreSQL
- Tailwind CSS
- 認証は NextAuth Auth.js v5（実装中）
- 既存 vanilla JS 版の `CLUB_ORDER` 並び順を踏襲する

---

## 1. 概要

ラウンド後の「振り返り画面」を実装する。手書きスコアカードのフォーマットを踏襲し、**ホールが列・打数が行**のテーブル形式で、各ショットセルに「クラブ／飛距離／結果タグ」の3要素を表示する。

**ゴール**: ユーザーが手書きで書いていた振り返りメモを完全にデジタル化し、後のAIキャディ機能の入力データにもなる。

---

## 2. 修正方針

### 2.1 データモデルの追加

現状のスキーマには **ショットの結果情報** と **パット数** を保持するフィールドがない。以下を追加する。

#### Prisma スキーマ変更

`prisma/schema.prisma` に対して:

```prisma
model Shot {
  id          String    @id @default(cuid())
  roundHoleId String
  roundHole   RoundHole @relation(fields: [roundHoleId], references: [id], onDelete: Cascade)
  shotNo      Int       // 1始まり（1打目, 2打目, ...）
  club        String?   // '1W', '5I', '56°' など
  carry       Int?      // null 可（OB 等で飛距離不明）

  // ★追加: OB は独立フラグ（タグとは別管理）
  isOB        Boolean   @default(false)

  // ★追加: ショット特性（状況・性質）- バンカー、リカバリー、ライン出し
  shotType    String?   // 'bunker' | 'recovery' | 'punch'

  // ★追加: ショット打感（結果の質）- スライス、フック、ナイスショット、ダフり、オーバー、ミス
  shotFeel    String?   // 'nice' | 'slice' | 'hook' | 'over' | 'fat' | 'miss'

  remaining   Int?      // グリーンまでの残り
  lat         Float?
  lng         Float?
  createdAt   DateTime  @default(now())

  @@index([roundHoleId, shotNo])
}

model RoundHole {
  id        String   @id @default(cuid())
  roundId   String
  round     Round    @relation(fields: [roundId], references: [id], onDelete: Cascade)
  holeNo    Int      // 1-18
  par       Int
  score     Int      // 総打数
  putts     Int      // ★追加: パット数
  shots     Shot[]

  @@unique([roundId, holeNo])
}
```

#### マイグレーションコマンド

```bash
npx prisma migrate dev --name add_shot_type_feel_ob_and_putts
```

#### 既存データへの遷移

- `putts`: `score - shots.filter(s => s.club !== 'PT').length` で算出
- `isOB`: 全件 `false` で初期化
- `shotType`, `shotFeel`: 全件 `null` で初期化（後から手動で追加可能）

### 2.2 UI レイアウトの方針

- ホール番号を **列** に、打数を **行** に配置
- IN（10-18H）と OUT（1-9H）で**2つのスコアカードカード**に分割
- 1つのカード内の行順序を以下に固定:
  1. ホール（ヘッダ）
  2. **Par**
  3. **スコア**（スコア差分で背景色を変更）
  4. 1打目
  5. 2打目
  6. 3打目
  7. 4打目
  8. 5打目
  9. **6打目以降**（折りたたみ、デフォルト非表示）
  10. **パット**
- ラベル列（左端）は `position: sticky; left: 0;` で横スクロール時も固定

### 2.3 ショット記録 UI の方針

カップイン後または1ショット記録後に、**OB / 特性 / 打感** の3軸でタグ付けできる UI を表示する。各軸はすべて optional。

```
┌─ OB ─────────────────────────────┐
│   [ OB ]  ← 単独トグル              │
└──────────────────────────────────┘
┌─ ショット特性 ────────────────────┐
│   [バンカー] [リカバリー] [ライン出し]  │
└──────────────────────────────────┘
┌─ ショット打感 ────────────────────┐
│   [ナイスショット]                  │
│   [スライス] [フック] [オーバー]     │
│   [ダフり] [ミス]                  │
└──────────────────────────────────┘
```

OB を選んだ場合は `carry = null` として保存する。

---

## 3. 結果タグ定義（2系統に分離）

```typescript
// constants/shotTags.ts

// ─────────────────────────────────────────────
// ショット特性（shotType）: 状況・性質を示すタグ
// ─────────────────────────────────────────────
export const SHOT_TYPES = {
  bunker:   { label: 'バンカー'   },
  recovery: { label: 'リカバリー' },
  punch:    { label: 'ライン出し' },
} as const;

export type ShotType = keyof typeof SHOT_TYPES;

// 特性タグは中立情報なので統一カラー（淡いグレー枠）
export const TYPE_BADGE_CLASS =
  'bg-zinc-100 text-zinc-700 border border-zinc-300';

// ─────────────────────────────────────────────
// ショット打感（shotFeel）: 結果の質を示すタグ
// ─────────────────────────────────────────────
export const SHOT_FEELS = {
  nice:  { label: 'ナイスショット', kind: 'good' },
  slice: { label: 'スライス',       kind: 'mid'  },
  hook:  { label: 'フック',         kind: 'mid'  },
  over:  { label: 'オーバー',       kind: 'mid'  },
  fat:   { label: 'ダフり',         kind: 'bad'  },
  miss:  { label: 'ミス',           kind: 'bad'  },
} as const;

export type ShotFeel = keyof typeof SHOT_FEELS;
export type ShotFeelKind = 'good' | 'mid' | 'bad';

export const FEEL_BADGE_CLASSES: Record<ShotFeelKind, string> = {
  good: 'bg-[#D6EDC1] text-[#1E4E0B]',
  mid:  'bg-[#FAE0B5] text-[#5A3608]',
  bad:  'bg-[#F7C1C1] text-[#501313]',
};

// ─────────────────────────────────────────────
// OB バッジ（isOB === true のときに表示）
// ─────────────────────────────────────────────
export const OB_BADGE_CLASS =
  'bg-[#C53D3D] text-white font-medium';
```

---

## 4. クラブ定義 / クラブ別平均飛距離

### 4.1 クラブ定数

既存の `clubs.js` の並び順を踏襲した TypeScript 版を作成。

```typescript
// constants/clubs.ts

/**
 * クラブの正規並び順（長い順）
 * 既存 vanilla JS 版 CLUB_ORDER と一致させること
 */
export const CLUB_ORDER = [
  '1W', '3W', '5W',
  '4UT', '5UT',
  '3I', '4I', '5I', '6I', '7I', '8I', '9I',
  'SW', 'PW', 'AW',
  '50°', '52°', '54°', '55°', '56°', '57°', '58°', '60°',
  'PT',
] as const;

export type Club = typeof CLUB_ORDER[number];

/**
 * パター以外（飛距離を集計する対象）
 */
export const SHOT_CLUBS = CLUB_ORDER.filter(c => c !== 'PT');

/**
 * クラブをカテゴリ別にプリセット化（クラブ編集UIで使用）
 */
export const CLUB_PRESETS = {
  'ドライバー':         ['1W'],
  'フェアウェイウッド': ['3W', '5W'],
  'ユーティリティ':     ['4UT', '5UT'],
  'アイアン':           ['3I', '4I', '5I', '6I', '7I', '8I', '9I'],
  'ウェッジ':           ['SW', 'PW', 'AW', '50°', '52°', '54°', '55°', '56°', '57°', '58°', '60°'],
  'パター':             ['PT'],
} as const;
```

### 4.2 クラブ別集計の型定義

```typescript
// types/clubStats.ts

export interface ClubStat {
  /** クラブ名（例: '5I', '56°'） */
  club: string;
  /** 平均飛距離（y、整数） */
  avg: number;
  /** 使用回数（OB と carry=null は除外したカウント） */
  count: number;
  /** 最小飛距離（y）- 振れ幅分析用 */
  min: number;
  /** 最大飛距離（y）- 振れ幅分析用 */
  max: number;
  /** 標準偏差（y）- 安定性分析用 */
  stddev: number;
}

export interface ClubStatsOptions {
  /** パターを集計に含めるか（デフォルト false） */
  includePutter?: boolean;
  /** OB ショットを含めるか（デフォルト false） */
  includeOB?: boolean;
}
```

### 4.3 集計関数

```typescript
// lib/aggregateClubStats.ts
import type { Shot } from '@prisma/client';
import { CLUB_ORDER } from '@/constants/clubs';
import type { ClubStat, ClubStatsOptions } from '@/types/clubStats';

/**
 * ショット配列からクラブ別の集計を行う。
 *
 * 集計ルール:
 * - パット (PT) は除外（オプションで含めることも可能）
 * - OB（isOB === true）は除外（オプションで含めることも可能）
 * - carry が null のものは除外
 * - 結果は CLUB_ORDER の並び順に整列
 *
 * @example
 * const stats = aggregateClubStats(allShots);
 * // [{ club: '1W', avg: 240, count: 5, min: 215, max: 260, stddev: 18.2 }, ...]
 */
export function aggregateClubStats(
  shots: Shot[],
  options: ClubStatsOptions = {}
): ClubStat[] {
  const { includePutter = false, includeOB = false } = options;

  // クラブ別にショットをグループ化
  const groups: Record<string, number[]> = {};

  for (const s of shots) {
    if (!s.club) continue;
    if (!includePutter && s.club === 'PT') continue;
    if (!includeOB && s.isOB) continue;
    if (s.carry == null) continue;

    if (!groups[s.club]) groups[s.club] = [];
    groups[s.club].push(s.carry);
  }

  // 各クラブごとに統計値を算出
  const stats: ClubStat[] = Object.entries(groups).map(([club, carries]) => {
    const sum = carries.reduce((a, b) => a + b, 0);
    const avg = sum / carries.length;
    const min = Math.min(...carries);
    const max = Math.max(...carries);
    const variance =
      carries.reduce((acc, c) => acc + (c - avg) ** 2, 0) / carries.length;
    const stddev = Math.sqrt(variance);

    return {
      club,
      avg: Math.round(avg),
      count: carries.length,
      min,
      max,
      stddev: Math.round(stddev * 10) / 10,
    };
  });

  // CLUB_ORDER の並び順でソート
  const orderMap = new Map<string, number>(
    CLUB_ORDER.map((c, i) => [c as string, i])
  );

  return stats.sort((a, b) => {
    const ia = orderMap.get(a.club) ?? Infinity;
    const ib = orderMap.get(b.club) ?? Infinity;
    return ia - ib;
  });
}

/**
 * 複数ラウンドから集計（通算統計用）
 */
export function aggregateClubStatsFromRounds(
  rounds: Array<{ holes: Array<{ shots: Shot[] }> }>,
  options: ClubStatsOptions = {}
): ClubStat[] {
  const allShots = rounds.flatMap(r => r.holes.flatMap(h => h.shots));
  return aggregateClubStats(allShots, options);
}

/**
 * 期間絞り込み付きの集計（例: 直近5R, 過去30日など）
 */
export function aggregateClubStatsByDateRange(
  rounds: Array<{ playedAt: Date; holes: Array<{ shots: Shot[] }> }>,
  fromDate: Date,
  toDate: Date = new Date(),
  options: ClubStatsOptions = {}
): ClubStat[] {
  const filtered = rounds.filter(
    r => r.playedAt >= fromDate && r.playedAt <= toDate
  );
  return aggregateClubStatsFromRounds(filtered, options);
}
```

### 4.4 クラブ別平均飛距離コンポーネント

```tsx
// app/round/[roundId]/_components/ClubAverageTable.tsx
import type { ClubStat } from '@/types/clubStats';

interface Props {
  stats: ClubStat[];
  /** 振れ幅（min-max）を表示するか */
  showRange?: boolean;
}

export function ClubAverageTable({ stats, showRange = false }: Props) {
  return (
    <div className="bg-white border border-zinc-200/50 rounded-xl p-3.5">
      <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">
        クラブ別 平均飛距離
      </div>
      <table className="w-full border-collapse text-sm tabular-nums">
        <thead>
          <tr className="text-[11px] text-zinc-500">
            <th className="text-left py-2 pl-1 border-b border-zinc-200/50 font-normal">
              クラブ
            </th>
            <th className="text-right py-2 pr-1 border-b border-zinc-200/50 font-normal">
              平均飛距離
            </th>
            <th className="text-right py-2 pr-1 border-b border-zinc-200/50 font-normal">
              使用回数
            </th>
            {showRange && (
              <th className="text-right py-2 pr-1 border-b border-zinc-200/50 font-normal">
                振れ幅
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {stats.map(s => (
            <tr key={s.club} className="border-b border-zinc-200/50 last:border-0">
              <td className="text-left py-2.5 pl-1 font-medium">{s.club}</td>
              <td className="text-right py-2.5 pr-1">
                <span className="font-medium">{s.avg}</span>
                <span className="text-zinc-500 text-[11px] ml-0.5">y</span>
              </td>
              <td className="text-right py-2.5 pr-1">
                <span>{s.count}</span>
                <span className="text-zinc-500 text-[11px] ml-0.5">回</span>
              </td>
              {showRange && (
                <td className="text-right py-2.5 pr-1 text-zinc-500 text-[11px]">
                  {s.min}〜{s.max}y
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 5. デザイントークン

### 5.1 カラー

| 用途 | カラーコード |
|------|------|
| クラブ名（青） | `#185FA5` |
| 打感タグ good 背景 | `#D6EDC1` 文字 `#1E4E0B` |
| 打感タグ mid 背景 | `#FAE0B5` 文字 `#5A3608` |
| 打感タグ bad 背景 | `#F7C1C1` 文字 `#501313` |
| 特性タグ 背景 | `bg-zinc-100` 文字 `text-zinc-700` |
| OB バッジ | `#C53D3D` 文字 white |
| バーディ系 背景 | `#C0DD97` |
| ボギー系 背景 | `#FAC775` |
| ダボ以上 背景 | `#F4C0D1` |
| Par 行 / パット行 背景 | `bg-zinc-50` |
| スコア行 背景 | `bg-zinc-100` |
| 空セル「—」色 | `text-zinc-300` |
| 区切り線 | `border-zinc-200/50` |

### 5.2 寸法

| 要素 | サイズ |
|------|------|
| セル幅 | `min-w-[50px] w-[50px]` |
| ラベル列幅 | `min-w-[64px] w-[64px]` |
| ショット行 高さ | `h-12` (48px、タグ2段あり得るので少し高め) |
| Par/パット行 高さ | `h-7` (28px) |
| スコア行 高さ | `h-9` (36px) |
| カードpadding | `p-3.5` |
| カード間ギャップ | `gap-3.5` |

### 5.3 タイポグラフィ

| 要素 | フォント |
|------|------|
| クラブ名 | `text-[11px] font-medium` |
| 飛距離 | `text-[10px]` |
| 特性タグ / 打感タグ | `text-[9px]` |
| Par / パット 数字 | `text-xs` |
| スコア 数字 | `text-sm font-medium` |
| 差分（+1, -1, E） | `text-[9px]` |

`font-variant-numeric: tabular-nums` を数値表示するセルすべてに適用。

---

## 6. コンポーネント構成

```
app/round/[roundId]/
├── page.tsx                          // データフェッチ + 結合
└── _components/
    ├── RoundSummaryCard.tsx          // 上部のサマリー
    ├── ScoreCardSection.tsx          // IN / OUT それぞれ1つずつ
    ├── ShotCell.tsx                  // 各打のセル（club/carry/OB/type/feel）
    ├── ScoreCell.tsx                 // スコアセル（色付き）
    ├── MoreShotsToggle.tsx           // 6打目以降の折りたたみ
    ├── ShotTagPicker.tsx             // ショット記録時のタグ選択UI
    └── ClubAverageTable.tsx          // 下部のクラブ平均
```

---

## 7. 参考コード

### 7.1 `ShotCell.tsx`（特性 + 打感の2タグ対応）

```tsx
import {
  SHOT_TYPES,
  SHOT_FEELS,
  FEEL_BADGE_CLASSES,
  TYPE_BADGE_CLASS,
  OB_BADGE_CLASS,
  type ShotType,
  type ShotFeel,
} from '@/constants/shotTags';

interface ShotCellProps {
  club?: string | null;
  carry?: number | null;
  isOB?: boolean;
  shotType?: ShotType | null;
  shotFeel?: ShotFeel | null;
}

export function ShotCell({
  club,
  carry,
  isOB,
  shotType,
  shotFeel,
}: ShotCellProps) {
  const isEmpty = !club && carry == null && !isOB && !shotType && !shotFeel;
  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-300 text-sm">
        —
      </div>
    );
  }

  const typeInfo = shotType ? SHOT_TYPES[shotType] : null;
  const feelInfo = shotFeel ? SHOT_FEELS[shotFeel] : null;

  return (
    <div className="flex flex-col items-center justify-center h-full py-1 leading-tight gap-0.5">
      {club && (
        <span className="text-[11px] font-medium text-[#185FA5]">{club}</span>
      )}
      {/* OB の場合は距離なしで OB バッジ表示、それ以外は飛距離 */}
      {isOB ? (
        <span className={`text-[9px] px-1.5 py-px rounded-full leading-tight ${OB_BADGE_CLASS}`}>
          OB
        </span>
      ) : carry != null ? (
        <span className="text-[10px] tabular-nums">{carry}y</span>
      ) : null}
      {/* 特性タグ */}
      {typeInfo && (
        <span
          className={`text-[9px] px-1.5 py-px rounded-full leading-tight whitespace-nowrap ${TYPE_BADGE_CLASS}`}
        >
          {typeInfo.label}
        </span>
      )}
      {/* 打感タグ */}
      {feelInfo && (
        <span
          className={`text-[9px] px-1.5 py-px rounded-full leading-tight whitespace-nowrap ${FEEL_BADGE_CLASSES[feelInfo.kind]}`}
        >
          {feelInfo.label}
        </span>
      )}
    </div>
  );
}
```

### 7.2 `ScoreCell.tsx`

```tsx
interface ScoreCellProps {
  score: number;
  par: number;
}

function getScoreBgClass(diff: number): string {
  if (diff <= -1) return 'bg-[#C0DD97] text-[#173404]';
  if (diff === 1) return 'bg-[#FAC775] text-[#412402]';
  if (diff >= 2) return 'bg-[#F4C0D1] text-[#4B1528]';
  return '';
}

export function ScoreCell({ score, par }: ScoreCellProps) {
  const diff = score - par;
  const diffLabel = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`;

  return (
    <div className={`flex items-center justify-center h-full ${getScoreBgClass(diff)}`}>
      <span className="inline-flex items-baseline gap-0.5">
        <span className="text-sm font-medium tabular-nums">{score}</span>
        <span className="text-[9px] border border-current rounded-full px-1 opacity-70">
          {diffLabel}
        </span>
      </span>
    </div>
  );
}
```

### 7.3 `ShotTagPicker.tsx`（ショット記録時の選択UI）

```tsx
'use client';

import {
  SHOT_TYPES,
  SHOT_FEELS,
  FEEL_BADGE_CLASSES,
  TYPE_BADGE_CLASS,
  OB_BADGE_CLASS,
  type ShotType,
  type ShotFeel,
} from '@/constants/shotTags';

interface Props {
  isOB: boolean;
  shotType: ShotType | null;
  shotFeel: ShotFeel | null;
  onChange: (next: {
    isOB: boolean;
    shotType: ShotType | null;
    shotFeel: ShotFeel | null;
  }) => void;
}

export function ShotTagPicker({ isOB, shotType, shotFeel, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* OB */}
      <button
        type="button"
        onClick={() => onChange({ isOB: !isOB, shotType, shotFeel })}
        className={`self-start px-3 py-1 rounded-full text-xs ${
          isOB ? OB_BADGE_CLASS : 'bg-white border border-zinc-300 text-zinc-700'
        }`}
      >
        OB
      </button>

      {/* 特性 */}
      <div>
        <div className="text-[10px] text-zinc-500 mb-1">ショット特性</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SHOT_TYPES) as ShotType[]).map(key => {
            const selected = shotType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  onChange({ isOB, shotType: selected ? null : key, shotFeel })
                }
                className={`px-2.5 py-1 rounded-full text-xs ${
                  selected ? TYPE_BADGE_CLASS : 'bg-white border border-zinc-300 text-zinc-500'
                }`}
              >
                {SHOT_TYPES[key].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 打感 */}
      <div>
        <div className="text-[10px] text-zinc-500 mb-1">ショット打感</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SHOT_FEELS) as ShotFeel[]).map(key => {
            const info = SHOT_FEELS[key];
            const selected = shotFeel === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  onChange({ isOB, shotType, shotFeel: selected ? null : key })
                }
                className={`px-2.5 py-1 rounded-full text-xs ${
                  selected
                    ? FEEL_BADGE_CLASSES[info.kind]
                    : 'bg-white border border-zinc-300 text-zinc-500'
                }`}
              >
                {info.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### 7.4 `ScoreCardSection.tsx`

```tsx
'use client';

import { useState } from 'react';
import { ShotCell } from './ShotCell';
import { ScoreCell } from './ScoreCell';
import type { RoundHole, Shot } from '@prisma/client';
import type { ShotType, ShotFeel } from '@/constants/shotTags';

type ShotData = Shot & {
  shotType: ShotType | null;
  shotFeel: ShotFeel | null;
};
type HoleData = RoundHole & { shots: ShotData[] };

interface ScoreCardSectionProps {
  side: 'IN' | 'OUT';
  holes: HoleData[]; // 9 holes
}

export function ScoreCardSection({ side, holes }: ScoreCardSectionProps) {
  const [showMore, setShowMore] = useState(false);

  const maxShots = Math.max(5, ...holes.map(h => h.shots.length));
  const totalScore = holes.reduce((sum, h) => sum + h.score, 0);
  const totalPar   = holes.reduce((sum, h) => sum + h.par, 0);
  const totalPutts = holes.reduce((sum, h) => sum + h.putts, 0);
  const diff = totalScore - totalPar;

  const baseRows = [1, 2, 3, 4, 5];
  const extraRows = Array.from(
    { length: Math.max(0, maxShots - 5) },
    (_, i) => i + 6
  );
  const hasExtra = extraRows.length > 0;
  const showExtra = showMore && hasExtra;

  return (
    <div className="bg-white border border-zinc-200/50 rounded-xl p-3.5">
      <div className="flex justify-between items-baseline mb-2">
        <div className="text-[11px] text-zinc-500 uppercase tracking-wider">
          {side}（{side === 'IN' ? '10〜18H' : '1〜9H'}）
        </div>
        <div className="text-xs text-zinc-700 tabular-nums">
          パット <strong className="text-zinc-900 font-medium text-sm">{totalPutts}</strong>
          {' ・ '}
          <strong className="text-zinc-900 font-medium text-sm">{totalScore}</strong>
          <span className="text-[#993C1D] text-[11px] ml-1">
            {diff > 0 ? `+${diff}` : diff === 0 ? 'E' : diff}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-3.5 px-3.5">
        <table className="border-separate border-spacing-0 tabular-nums" style={{ width: 'max-content' }}>
          <thead>
            <tr>
              <Th sticky>ホール</Th>
              {holes.map(h => (
                <Th key={h.holeNo}>{h.holeNo}</Th>
              ))}
              <Th total>合計</Th>
            </tr>
          </thead>
          <tbody>
            {/* Par 行 */}
            <tr>
              <LabelCell muted>Par</LabelCell>
              {holes.map(h => <Cell key={h.holeNo} muted>{h.par}</Cell>)}
              <Cell total muted>{totalPar}</Cell>
            </tr>

            {/* スコア 行 */}
            <tr>
              <LabelCell shaded>スコア</LabelCell>
              {holes.map(h => (
                <td key={h.holeNo} className="border-b border-r border-zinc-200/50 h-9 min-w-[50px] w-[50px] bg-zinc-100 p-0">
                  <ScoreCell score={h.score} par={h.par} />
                </td>
              ))}
              <Cell total>
                <span className="inline-flex items-baseline gap-0.5">
                  <span className="text-sm font-medium">{totalScore}</span>
                  <span className="text-[9px] border border-current rounded-full px-1 opacity-70">
                    {diff > 0 ? `+${diff}` : diff === 0 ? 'E' : diff}
                  </span>
                </span>
              </Cell>
            </tr>

            {/* 1〜5打目 */}
            {baseRows.map(n => <ShotRow key={n} no={n} holes={holes} />)}

            {/* 6打目以降の折りたたみトグル */}
            {hasExtra && (
              <tr>
                <td className="sticky left-0 bg-white border-b border-r border-zinc-200/50 px-2 z-10">
                  <button
                    type="button"
                    onClick={() => setShowMore(s => !s)}
                    className="text-[10px] text-zinc-500 flex items-center gap-1 w-full py-1"
                  >
                    6打目以降
                    <span className={`text-[8px] transition-transform ${showMore ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                </td>
                <td colSpan={holes.length + 1} className="text-left text-[10px] text-zinc-400 pl-1.5">
                  {showMore ? '展開中（タップで折りたたみ）' : `${extraRows.length}行隠れています`}
                </td>
              </tr>
            )}

            {showExtra && extraRows.map(n => <ShotRow key={n} no={n} holes={holes} />)}

            {/* パット 行 */}
            <tr>
              <LabelCell muted>パット</LabelCell>
              {holes.map(h => <Cell key={h.holeNo} muted>{h.putts}</Cell>)}
              <Cell total muted>{totalPutts}</Cell>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────── 内部ヘルパー ───────────

function ShotRow({ no, holes }: { no: number; holes: HoleData[] }) {
  return (
    <tr>
      <LabelCell>{no}打目</LabelCell>
      {holes.map(h => {
        const shot = h.shots.find(s => s.shotNo === no);
        return (
          <td key={h.holeNo} className="border-b border-r border-zinc-200/50 h-12 min-w-[50px] w-[50px] p-0">
            <ShotCell
              club={shot?.club}
              carry={shot?.carry}
              isOB={shot?.isOB}
              shotType={shot?.shotType ?? null}
              shotFeel={shot?.shotFeel ?? null}
            />
          </td>
        );
      })}
      <td className="border-b border-r border-zinc-200/50 h-12 min-w-[50px] w-[50px] bg-zinc-50" />
    </tr>
  );
}

function Th({ children, sticky, total }: { children: React.ReactNode; sticky?: boolean; total?: boolean }) {
  const cls = [
    'h-8 border-b border-r border-zinc-200/50 text-xs font-medium text-zinc-900 bg-zinc-100',
    'min-w-[50px] w-[50px]',
    sticky && 'sticky left-0 z-10 min-w-[64px] w-[64px] text-left px-2',
    total && 'bg-zinc-100 font-medium',
  ].filter(Boolean).join(' ');
  return <th className={cls}>{children}</th>;
}

function LabelCell({ children, muted, shaded }: { children: React.ReactNode; muted?: boolean; shaded?: boolean }) {
  const bg = shaded ? 'bg-zinc-100' : muted ? 'bg-zinc-50' : 'bg-white';
  return (
    <td className={`sticky left-0 z-10 border-b border-r border-zinc-200/50 text-left px-2 text-[11px] font-medium text-zinc-600 min-w-[64px] w-[64px] ${bg}`}>
      {children}
    </td>
  );
}

function Cell({ children, muted, total }: { children?: React.ReactNode; muted?: boolean; total?: boolean }) {
  const cls = [
    'border-b border-r border-zinc-200/50 min-w-[50px] w-[50px] text-center',
    muted ? 'h-7 text-xs bg-zinc-50' : 'h-12',
    total && 'bg-zinc-100 font-medium',
  ].filter(Boolean).join(' ');
  return <td className={cls}>{children}</td>;
}
```

### 7.5 `page.tsx`

```tsx
import { prisma } from '@/lib/prisma';
import { aggregateClubStats } from '@/lib/aggregateClubStats';
import { RoundSummaryCard } from './_components/RoundSummaryCard';
import { ScoreCardSection } from './_components/ScoreCardSection';
import { ClubAverageTable } from './_components/ClubAverageTable';

export default async function RoundReviewPage({
  params,
}: {
  params: { roundId: string };
}) {
  const round = await prisma.round.findUnique({
    where: { id: params.roundId },
    include: {
      holes: {
        orderBy: { holeNo: 'asc' },
        include: {
          shots: { orderBy: { shotNo: 'asc' } },
        },
      },
      course: true,
    },
  });

  if (!round) return <div>ラウンドが見つかりません</div>;

  const outHoles = round.holes.filter(h => h.holeNo <= 9);
  const inHoles  = round.holes.filter(h => h.holeNo >= 10);
  const allShots = round.holes.flatMap(h => h.shots);

  // 振れ幅も表示するなら showRange=true
  const clubStats = aggregateClubStats(allShots);

  return (
    <div className="flex flex-col gap-3.5 p-1">
      <RoundSummaryCard round={round} />
      {inHoles.length > 0  && <ScoreCardSection side="IN"  holes={inHoles  as any} />}
      {outHoles.length > 0 && <ScoreCardSection side="OUT" holes={outHoles as any} />}
      <ClubAverageTable stats={clubStats} showRange />
    </div>
  );
}
```

---

## 8. 実装ステップ（推奨順）

1. **Prisma スキーマ更新 + マイグレーション**（`isOB`, `shotType`, `shotFeel`, `putts` フィールド追加）
2. **`constants/clubs.ts`** を作成（既存 vanilla JS の `CLUB_ORDER` と一致させる）
3. **`constants/shotTags.ts`** を作成（`SHOT_TYPES`, `SHOT_FEELS` の2系統）
4. **`types/clubStats.ts`** を作成
5. **`lib/aggregateClubStats.ts`** を作成（min/max/stddev も算出）
6. **`_components/ShotCell.tsx`** と **`ScoreCell.tsx`** を作成
7. **`_components/ScoreCardSection.tsx`** を作成
8. **`_components/RoundSummaryCard.tsx`** と **`ClubAverageTable.tsx`** を作成
9. **`_components/ShotTagPicker.tsx`** を作成（ショット記録UI用）
10. **`page.tsx`** で結合
11. **モバイル実機確認**（横スクロール、stickyラベル列）

---

## 9. 留意事項

- **OB の表示**: `ShotCell` 内では「飛距離」の位置に OB バッジを表示する（重ねない）。クラブ名は表示可
- **特性 + 打感 の同時付与**: 例「リカバリー × ナイスショット」「バンカー × オーバー」など、2タグ同時に付くケースあり。`ShotCell` は両方を縦に並べて表示
- **6打目以降の判定**: 各ホールで `shots.length` の最大値が5以下なら折りたたみボタン非表示、6以上なら自動で折りたたみ可能に
- **`stddev`（標準偏差）の使い道**: 後の AI キャディで「このクラブはバラつきが大きい」という分析に使う。現時点では UI 非表示でも OK
- **既存データへの遷移**: `putts` は `score - 非PTショット数`、`isOB` は false、`shotType`/`shotFeel` は null で初期化
- **タグの後付け追加**: 既存ショットレコードにも振り返り画面から右クリック等で `shotType`/`shotFeel` を追加できる UI を将来追加（Phase 2）

---

## 10. 完了条件

- [ ] Prisma マイグレーション成功（`isOB`/`shotType`/`shotFeel`/`putts` カラムが作成される）
- [ ] `/round/[roundId]` で過去ラウンドの振り返りが見られる
- [ ] IN/OUT それぞれのスコアカードが正しく表示される
- [ ] スコアセルの色がスコア差分で変わる
- [ ] OB が赤バッジで表示される
- [ ] 特性タグ（バンカー/リカバリー/ライン出し）が中立色で表示される
- [ ] 打感タグ（ナイスショット/スライス/フック/オーバー/ダフり/ミス）が色分けで表示される
- [ ] 6打目以降の折りたたみが動作する
- [ ] クラブ別平均飛距離テーブルが正しく集計される（min/max/stddev も内部保持）
- [ ] モバイル幅で横スクロールが動作し、ラベル列が sticky で固定される

---

## 11. 完了後のバッチ報告事項

実装後、以下をまとめて報告すること:

1. 本ドキュメントとの実装上の差分（型名、ファイル配置、データ取得方法など）
2. 既存 GitHub コードにあった「想定外の構造」や、それに合わせるために必要だった修正
3. 動作確認結果（特にモバイル横スクロール、`ShotTagPicker` の操作感）
4. 未対応事項・次フェーズ送りにした項目（例: タグの後付け編集UI）

以上。

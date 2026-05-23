// ─────────────────────────────────────────────
// ショット特性（shotType）: 状況・性質を示すタグ
// ─────────────────────────────────────────────
export const SHOT_TYPES = {
  bunker:   { label: 'バンカー'   },
  recovery: { label: 'リカバリー' },
  punch:    { label: 'ライン出し' },
} as const

export type ShotType = keyof typeof SHOT_TYPES

// 特性タグは中立情報なので統一カラー（淡いグレー枠）
export const TYPE_BADGE_CLASS =
  'bg-zinc-100 text-zinc-700 border border-zinc-300'

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
} as const

export type ShotFeel = keyof typeof SHOT_FEELS
export type ShotFeelKind = 'good' | 'mid' | 'bad'

export const FEEL_BADGE_CLASSES: Record<ShotFeelKind, string> = {
  good: 'bg-[#D6EDC1] text-[#1E4E0B]',
  mid:  'bg-[#FAE0B5] text-[#5A3608]',
  bad:  'bg-[#F7C1C1] text-[#501313]',
}

// ─────────────────────────────────────────────
// OB バッジ（isOB === true のときに表示）
// ─────────────────────────────────────────────
export const OB_BADGE_CLASS =
  'bg-[#C53D3D] text-white font-medium'

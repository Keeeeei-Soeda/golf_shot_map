/**
 * クラブの正規並び順（長い順）
 * 既存 vanilla JS 版 CLUB_ORDER (src/app/golf/state.ts) と一致
 */
export const CLUB_ORDER = [
  '1W', '3W', '5W',
  '4UT', '5UT',
  '3I', '4I', '5I', '6I', '7I', '8I', '9I',
  'SW', 'PW', 'AW',
  '50°', '52°', '54°', '55°', '56°', '57°', '58°', '60°',
  'PT',
] as const

export type Club = typeof CLUB_ORDER[number]

/** パター以外（飛距離を集計する対象） */
export const SHOT_CLUBS = CLUB_ORDER.filter(c => c !== 'PT')

/** クラブをカテゴリ別にプリセット化 */
export const CLUB_PRESETS = {
  'ドライバー':         ['1W'],
  'フェアウェイウッド': ['3W', '5W'],
  'ユーティリティ':     ['4UT', '5UT'],
  'アイアン':           ['3I', '4I', '5I', '6I', '7I', '8I', '9I'],
  'ウェッジ':           ['SW', 'PW', 'AW', '50°', '52°', '54°', '55°', '56°', '57°', '58°', '60°'],
  'パター':             ['PT'],
} as const

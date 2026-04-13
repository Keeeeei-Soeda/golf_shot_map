export interface HoleData {
  no: number
  par: number
  yards?: { back: number; reg: number; ladies: number }
  tee: { lat: number; lng: number }
  tees?: {
    regular?: { lat: number; lng: number }
    ladies?: { lat: number; lng: number }
    [key: string]: { lat: number; lng: number } | undefined
  }
  front: { lat: number; lng: number }
  center: { lat: number; lng: number }
  back: { lat: number; lng: number }
}

export interface CourseData {
  name: string
  cid: number
  holes: HoleData[]
}

export interface GolfCourse {
  name: string
  pref: string
  gcid: number
  lat: number
  lng: number
  courses: CourseData[]
}

export interface ShotRecord {
  no: number
  lat: number
  lng: number
  club: string
  carry: number
  remaining: number
  fromLabel: string
  evaluation: string[]  // ['nice','miss','duff','slice','hook']
}

export interface HoleMeta {
  cupIn: boolean
  scoreDiff: number
  par: number
  totalShots: number
  putts: number | null
  penaltyFrom: number | null
}

export interface RoundShots {
  [key: string]: ShotRecord[] | HoleMeta
}

export interface RoundRecord {
  id: string
  date: string
  gcName: string
  courseName: string
  shots: RoundShots
  updatedAt: number
}

export interface AppState {
  gcIdx: number | null
  cIdx: number | null
  hIdx: number
}

export const SCORE_DEFS = [
  { diff: -2, name: 'イーグル',     cls: 'eagle'  },
  { diff: -1, name: 'バーディ',     cls: 'birdie' },
  { diff:  0, name: 'パー',         cls: 'par'    },
  { diff:  1, name: 'ボギー',       cls: 'bogey'  },
  { diff:  2, name: 'ダブルボギー', cls: 'dbl'    },
  { diff:  3, name: 'トリプルボギー', cls: 'tpl'  },
] as const

export const EVAL_TAGS = [
  { key: 'nice',  label: '👍 ナイス'  },
  { key: 'miss',  label: '😤 ミス'    },
  { key: 'duff',  label: '⛏ ダフり'  },
  { key: 'slice', label: '↗ スライス' },
  { key: 'hook',  label: '↙ フック'   },
] as const

export const CLUB_PRESETS: Record<string, string[]> = {
  'ドライバー':        ['1W'],
  'フェアウェイウッド': ['3W', '5W'],
  'ユーティリティ':    ['4UT', '5UT'],
  'アイアン':          ['3I','4I','5I','6I','7I','8I','9I'],
  'ウェッジ':          ['SW','PW','AW','50°','52°','54°','55°','56°','57°','58°','60°'],
  'パター':            ['PT'],
}

export const CLUB_ORDER = [
  '1W','3W','5W','4UT','5UT',
  '3I','4I','5I','6I','7I','8I','9I',
  'SW','PW','AW','50°','52°','54°','55°','56°','57°','58°','60°','PT',
]

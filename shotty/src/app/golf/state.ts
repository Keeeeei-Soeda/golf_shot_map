/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// 定数
// ============================================================
export const DEFAULT_CLUBS = ['1W','3W','5I','6I','7I','8I','9I','56°','PW','SW','PT','','','']
export const SCORE_DEFS = [
  { diff: -2, name: 'イーグル',      cls: 'eagle'  },
  { diff: -1, name: 'バーディ',      cls: 'birdie' },
  { diff:  0, name: 'パー',          cls: 'par'    },
  { diff:  1, name: 'ボギー',        cls: 'bogey'  },
  { diff:  2, name: 'ダブルボギー',  cls: 'dbl'    },
  { diff:  3, name: 'トリプルボギー',cls: 'tpl'    },
]
export const SHOT_RESULTS = [
  { key: 'ナイスショット', icon: '👍', cls: 'nice'  },
  { key: 'ミスショット',   icon: '😤', cls: 'miss'  },
  { key: 'ダフり',         icon: '⛏',  cls: 'duff'  },
  { key: 'スライス',       icon: '↗',  cls: 'slice' },
  { key: 'フック',         icon: '↙',  cls: 'hook'  },
]
export const CLUB_PRESETS: Record<string, string[]> = {
  'ドライバー':        ['1W'],
  'フェアウェイウッド':['3W','5W'],
  'ユーティリティ':    ['4UT','5UT'],
  'アイアン':          ['3I','4I','5I','6I','7I','8I','9I'],
  'ウェッジ':          ['SW','PW','AW','50°','52°','54°','55°','56°','57°','58°','60°'],
  'パター':            ['PT'],
}
export const CLUB_ORDER = ['1W','3W','5W','4UT','5UT','3I','4I','5I','6I','7I','8I','9I','SW','PW','AW','50°','52°','54°','55°','56°','57°','58°','60°','PT']
export const TEE_TYPES = [
  { key: 'regular', name: 'レギュラーティー', icon: '⛳' },
  { key: 'ladies',  name: 'レディースティー',  icon: '🌸' },
]

// ============================================================
// ラウンド状態（オブジェクトにすることで他モジュールからも代入可能）
// ============================================================
export const st = {
  gcIdx: null as number|null,
  cIdx:  null as number|null,
  cIdx2: null as number|null,
  hIdx:  0,
  teeType: 'regular',
}

// ============================================================
// 共有ミュータブル状態（gs = golf state）
// ============================================================
export const gs = {
  map:                 null as any,
  mapsLoaded:          false,
  appInitialized:      false,
  appMode:             'measure',

  // 計測
  measureClick:        null as any,
  teeLine:             null as any,
  pinLine:             null as any,
  measureFromLabel:    null as any,
  measureToLabel:      null as any,
  measureSelectedPin:  null as string|null,

  // ショットレイヤー
  shotMarkers:         [] as any[],
  shotLines:           [] as any[],

  // ペンディング
  pendingPos:          null as any,
  selectedClub:        null as string|null,
  pendingMarker:       null as any,
  pendingCarryLine:    null as any,
  pendingPinLine:      null as any,
  pendingCarryLabel:   null as any,
  pendingPinLabel:     null as any,
  selectedResult:      null as string|null,

  // GPS
  gpsMarker:           null as any,
  gpsWatch:            null as number|null,
  gpsActive:           false,

  // ラウンドデータ
  roundShots:          {} as Record<string, any>,
  roundId:             null as string|null,

  // カップインパネル
  cpSelectedDiff:      0,
  cpStrokePenalty:     0,
  cpObType:            null as string|null,
  cpPutts:             null as number|null,
  shotObType:          null as string|null,

  // UI状態
  yardageInfoOpen:     false,

  // クラブ
  CLUBS:               [] as string[],
  editingClubs:        [] as string[],

  // インラインコース選択
  _emSelectedGcIdx:    null as number|null,

  // 過去記録オーバーレイ（strategy）
  strategyActive:      false,
  strategyCourseData:  {} as Record<number, Record<number, any[]>>,
  strategyGcIdx:       null as number|null,
  strategyRoundId:     null as string|null,
  strategySource:      'local' as string,
  strategyMarkers:     [] as any[],
  strategyLines:       [] as any[],
}

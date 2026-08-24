/**
 * 機能ランチャーのタイル定義。
 * 仮アイコン（絵文字）は後から PNG 差し替えしやすいよう icon を分離している。
 * iconSrc を渡せば img、なければ icon（絵文字）を表示する。
 *
 * 並び・グルーピングの単一ソース。差し替えはこのファイルのみ。
 */
export type LauncherActionId =
  | 'scorecard'
  | 'shots'
  | 'history'
  | 'clubs'
  | 'gps'
  | 'clearHole'

export type LauncherItem = {
  id: LauncherActionId
  label: string
  /** 仮アイコン（絵文字）。最終は iconSrc に差し替え */
  icon: string
  /** 本番用シルエット。未設定なら icon を使う */
  iconSrc?: string
  ariaLabel: string
  /** 危険操作（確認ダイアログ） */
  destructive?: boolean
}

export type LauncherGroup = {
  id: string
  /** グループ見出し。null なら見出しなし（危険操作など） */
  label: string | null
  /** 直前に仕切り線を入れる（危険操作の分離） */
  separatorBefore?: boolean
  items: LauncherItem[]
}

const SCORECARD: LauncherItem = {
  id: 'scorecard',
  label: 'スコアカード',
  icon: '📊',
  ariaLabel: 'スコアカードを開く',
}

const SHOTS: LauncherItem = {
  id: 'shots',
  label: 'ショット履歴',
  icon: '📝',
  ariaLabel: 'このホールのショット履歴',
}

const HISTORY: LauncherItem = {
  id: 'history',
  label: 'ラウンド履歴',
  icon: '📋',
  ariaLabel: 'ラウンド履歴を開く',
}

const CLUBS: LauncherItem = {
  id: 'clubs',
  label: 'クラブセット',
  icon: '🏌️',
  ariaLabel: 'クラブセットを編集',
}

const GPS: LauncherItem = {
  id: 'gps',
  label: 'GPS追尾',
  icon: '📍',
  ariaLabel: 'GPS追尾のオンオフ',
}

const CLEAR_HOLE: LauncherItem = {
  id: 'clearHole',
  label: 'ホール消去',
  icon: '🗑',
  ariaLabel: 'このホールの記録を消去する',
  destructive: true,
}

/** 確定仕様の並び：記録を見る → 調整 →（区切り）→ ホール消去 */
export const LAUNCHER_GROUPS: LauncherGroup[] = [
  {
    id: 'view',
    label: '記録を見る',
    items: [SCORECARD, SHOTS, HISTORY],
  },
  {
    id: 'adjust',
    label: '調整',
    items: [CLUBS, GPS],
  },
  {
    id: 'danger',
    label: null,
    separatorBefore: true,
    items: [CLEAR_HOLE],
  },
]

/** フラット一覧（テスト・参照用）。順序は LAUNCHER_GROUPS に従う */
export const LAUNCHER_ITEMS: LauncherItem[] = LAUNCHER_GROUPS.flatMap(g => g.items)

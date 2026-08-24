/**
 * 機能ランチャーのタイル定義。
 * 仮アイコン（絵文字）は後から PNG 差し替えしやすいよう icon を分離している。
 * iconSrc を渡せば img、なければ icon（絵文字）を表示する。
 */
export type LauncherActionId =
  | 'scorecard'
  | 'history'
  | 'gps'
  | 'clubs'
  | 'shots'
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

export const LAUNCHER_ITEMS: LauncherItem[] = [
  {
    id: 'scorecard',
    label: 'スコアカード',
    icon: '📊',
    ariaLabel: 'スコアカードを開く',
  },
  {
    id: 'history',
    label: 'ラウンド履歴',
    icon: '📋',
    ariaLabel: 'ラウンド履歴を開く',
  },
  {
    id: 'gps',
    label: 'GPS追尾',
    icon: '📍',
    ariaLabel: 'GPS追尾のオンオフ',
  },
  {
    id: 'clubs',
    label: 'クラブセット',
    icon: '🏌️',
    ariaLabel: 'クラブセットを編集',
  },
  {
    id: 'shots',
    label: 'ショット履歴',
    icon: '📝',
    ariaLabel: 'このホールのショット履歴',
  },
  {
    id: 'clearHole',
    label: 'ホール消去',
    icon: '🗑',
    ariaLabel: 'このホールのショットをすべて削除',
    destructive: true,
  },
]

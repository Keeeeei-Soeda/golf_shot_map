import { countCompletedHoles } from '@/lib/signup-prompt'

/**
 * 進行中ラウンドかどうかを判定
 * - 1ホール以上記録済み
 * - かつ18ホール完了していない
 */
export function isRoundInProgress(roundShots: Record<string, unknown>): boolean {
  if (!roundShots || Object.keys(roundShots).length === 0) return false
  const completed = countCompletedHoles({ shots: roundShots })
  return completed > 0 && completed < 18
}

/**
 * 進行中ラウンドの記録済みホール数
 */
export function getCompletedHoleCount(roundShots: Record<string, unknown>): number {
  if (!roundShots) return 0
  return countCompletedHoles({ shots: roundShots })
}

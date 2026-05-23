import { COURSES } from '@/data/courses'
import { countCompletedHoles } from '@/lib/signup-prompt'

const ACTIVE_ROUND_KEY = 'golfActiveRound'

export type InProgressRoundInfo = {
  id: string
  gcName: string
  courseLabel: string
  completedHoles: number
  date: string
}

/**
 * 起動時に進行中ラウンドがあるかを確認
 * golfActiveRound に 1ホール以上記録されている場合 true
 */
export function hasInProgressRound(): boolean {
  if (typeof window === 'undefined') return false
  const raw = localStorage.getItem(ACTIVE_ROUND_KEY)
  if (!raw) return false
  try {
    const d = JSON.parse(raw)
    const shots = d.roundShots ?? {}
    const completed = countCompletedHoles({ shots })
    return completed > 0
  } catch {
    return false
  }
}

/**
 * 進行中ラウンドのサマリー情報を返す
 */
export function getInProgressRoundInfo(): InProgressRoundInfo | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(ACTIVE_ROUND_KEY)
  if (!raw) return null
  try {
    const d = JSON.parse(raw)
    const shots = d.roundShots ?? {}
    const completed = countCompletedHoles({ shots })
    if (completed === 0) return null

    const gcIdx: number = d.gcIdx ?? 0
    const cIdx: number = d.cIdx ?? 0
    const cIdx2: number | null = d.cIdx2 ?? null
    const gc = COURSES[gcIdx]
    const gcName = gc?.name ?? ''
    const firstCourseName = gc?.courses[cIdx]?.name ?? ''
    const secondCourseName = cIdx2 !== null ? (gc?.courses[cIdx2]?.name ?? '') : ''
    const courseLabel = secondCourseName
      ? `${firstCourseName} → ${secondCourseName}`
      : firstCourseName

    return {
      id: d.roundId ?? '',
      gcName,
      courseLabel,
      completedHoles: completed,
      date: new Date().toLocaleDateString('ja-JP'),
    }
  } catch {
    return null
  }
}

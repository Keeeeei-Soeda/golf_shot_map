import type { GolfCourse } from '@/types'

export function getCourseCount(gc: GolfCourse): number {
  return gc.courses?.length ?? 0
}

/**
 * 2コース構成の「2択選択肢」を生成
 */
export function getTwoChoicePairs(gc: GolfCourse): Array<{
  first: number
  second: number
  label: string
}> {
  if (gc.courses.length !== 2) return []
  const a = gc.courses[0].name
  const b = gc.courses[1].name
  return [
    { first: 0, second: 1, label: `${a} → ${b}` },
    { first: 1, second: 0, label: `${b} → ${a}` },
  ]
}

/**
 * 3コース以上のとき、2つ目のセレクタで選択可能なコース（1つ目を除外）
 */
export function getAvailableSecondCourses(
  gc: GolfCourse,
  firstCIdx: number
): Array<{ cIdx: number; name: string }> {
  return gc.courses
    .map((c, idx) => ({ cIdx: idx, name: c.name }))
    .filter((c) => c.cIdx !== firstCIdx)
}

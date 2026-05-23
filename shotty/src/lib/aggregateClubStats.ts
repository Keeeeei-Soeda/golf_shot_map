import type { Shot } from '@prisma/client'
import { CLUB_ORDER } from '@/constants/clubs'
import type { ClubStat, ClubStatsOptions } from '@/types/clubStats'

/**
 * ショット配列からクラブ別の集計を行う。
 *
 * 集計ルール:
 * - パット (PT) は除外（オプションで含めることも可能）
 * - OB（isOB === true）は除外（オプションで含めることも可能）
 * - carry が null / 0 のものは除外
 * - 結果は CLUB_ORDER の並び順に整列
 */
export function aggregateClubStats(
  shots: Shot[],
  options: ClubStatsOptions = {}
): ClubStat[] {
  const { includePutter = false, includeOB = false } = options

  const groups: Record<string, number[]> = {}

  for (const s of shots) {
    if (!s.club) continue
    if (!includePutter && s.club === 'PT') continue
    if (!includeOB && s.isOB) continue
    if (s.carry == null || s.carry === 0) continue

    if (!groups[s.club]) groups[s.club] = []
    groups[s.club].push(Math.round(s.carry))
  }

  const stats: ClubStat[] = Object.entries(groups).map(([club, carries]) => {
    const sum = carries.reduce((a, b) => a + b, 0)
    const avg = sum / carries.length
    const min = Math.min(...carries)
    const max = Math.max(...carries)
    const variance =
      carries.reduce((acc, c) => acc + (c - avg) ** 2, 0) / carries.length
    const stddev = Math.sqrt(variance)

    return {
      club,
      avg: Math.round(avg),
      count: carries.length,
      min,
      max,
      stddev: Math.round(stddev * 10) / 10,
    }
  })

  const orderMap = new Map<string, number>(
    CLUB_ORDER.map((c, i) => [c as string, i])
  )

  return stats.sort((a, b) => {
    const ia = orderMap.get(a.club) ?? Infinity
    const ib = orderMap.get(b.club) ?? Infinity
    return ia - ib
  })
}

/**
 * 複数ラウンドから集計（通算統計用）
 */
export function aggregateClubStatsFromRounds(
  rounds: Array<{ holes: Array<{ shots: Shot[] }> }>,
  options: ClubStatsOptions = {}
): ClubStat[] {
  const allShots = rounds.flatMap(r => r.holes.flatMap(h => h.shots))
  return aggregateClubStats(allShots, options)
}

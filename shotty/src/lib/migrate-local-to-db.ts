import type { LocalRound } from '@/lib/round-mapper'

const SYNCED_FLAG_KEY = 'shotty_synced_to_cloud'

/**
 * localStorage の golfRounds / golfClubSet を /api/sync に投げる。
 * 成功時、同期済みフラグを立てるが、データ自体は消さない。
 */
export async function migrateLocalToDb(): Promise<{
  ok: boolean
  importedRounds: number
  importedClubs: number
  error?: string
}> {
  try {
    const roundsRaw = localStorage.getItem('golfRounds')
    const clubsRaw = localStorage.getItem('golfClubSet')

    const rounds: LocalRound[] = roundsRaw ? JSON.parse(roundsRaw) : []
    const clubs: string[] = clubsRaw ? JSON.parse(clubsRaw) : []

    if (rounds.length === 0 && clubs.length === 0) {
      return { ok: true, importedRounds: 0, importedClubs: 0 }
    }

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rounds, clubs }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return {
        ok: false,
        importedRounds: 0,
        importedClubs: 0,
        error: (err as { error?: string }).error ?? `HTTP ${res.status}`,
      }
    }

    const data = await res.json()

    // 重複移行防止フラグ
    localStorage.setItem(SYNCED_FLAG_KEY, new Date().toISOString())

    return {
      ok: true,
      importedRounds: data.imported.rounds,
      importedClubs: data.imported.clubs,
    }
  } catch (e) {
    return {
      ok: false,
      importedRounds: 0,
      importedClubs: 0,
      error: e instanceof Error ? e.message : 'Unknown error',
    }
  }
}

/** 同期済みか確認 */
export function isAlreadySynced(): boolean {
  return !!localStorage.getItem(SYNCED_FLAG_KEY)
}

/** 未同期のラウンド数 */
export function getUnsyncedRoundCount(): number {
  if (isAlreadySynced()) return 0
  const raw = localStorage.getItem('golfRounds')
  return raw ? JSON.parse(raw).length : 0
}

'use client'
import { useState, useCallback } from 'react'
import type { RoundRecord, RoundShots } from '@/types'

const MAX_ROUNDS = 30

export function useRound() {
  const [roundShots, setRoundShots] = useState<RoundShots>({})
  const [roundId, setRoundId] = useState<string | null>(null)

  const startRound = useCallback((_gcName: string, _courseName: string) => {
    const id = 'round_' + Date.now()
    setRoundId(id)
    setRoundShots({})
    return id
  }, [])

  const saveRound = useCallback((
    id: string,
    gcName: string,
    courseName: string,
    shots: RoundShots
  ) => {
    if (!id) return
    const all: RoundRecord[] = JSON.parse(
      localStorage.getItem('golfRounds') ?? '[]'
    )
    const idx = all.findIndex(r => r.id === id)
    const data: RoundRecord = {
      id,
      date: new Date().toLocaleDateString('ja-JP'),
      gcName,
      courseName,
      shots,
      updatedAt: Date.now(),
    }
    if (idx >= 0) all[idx] = data
    else all.unshift(data)
    localStorage.setItem('golfRounds', JSON.stringify(all.slice(0, MAX_ROUNDS)))
  }, [])

  const loadRound = useCallback((id: string) => {
    const all: RoundRecord[] = JSON.parse(
      localStorage.getItem('golfRounds') ?? '[]'
    )
    const r = all.find(x => x.id === id)
    if (r) {
      setRoundId(r.id)
      setRoundShots(r.shots)
    }
    return r ?? null
  }, [])

  const getAllRounds = useCallback((): RoundRecord[] => {
    return JSON.parse(localStorage.getItem('golfRounds') ?? '[]')
  }, [])

  const clearAllRounds = useCallback(() => {
    localStorage.removeItem('golfRounds')
  }, [])

  return {
    roundShots,
    setRoundShots,
    roundId,
    startRound,
    saveRound,
    loadRound,
    getAllRounds,
    clearAllRounds,
  }
}

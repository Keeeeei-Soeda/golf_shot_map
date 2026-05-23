'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import type { LocalRound, RoundView } from '@/lib/round-mapper'

const STORAGE_KEY = 'golfRounds'

/**
 * ログイン中 → DB、未ログイン → localStorage を自動で切り替える hook。
 * golf/logic.ts の直接 localStorage 書き込みとは独立して動作。
 */
export function useRounds() {
  const { data: session, status } = useSession()
  const isLoggedIn = !!session?.user?.id

  const [rounds, setRounds] = useState<RoundView[]>([])
  const [loading, setLoading] = useState(true)
  const [isLimited, setIsLimited] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      if (isLoggedIn) {
        const res = await fetch('/api/rounds')
        if (res.ok) {
          const data = await res.json()
          setRounds(data.rounds)
          setIsLimited(data.isLimited)
          setTotalCount(data.totalCount)
        }
      } else {
        const raw = localStorage.getItem(STORAGE_KEY)
        const local: RoundView[] = raw ? JSON.parse(raw) : []
        setRounds(local)
        setIsLimited(false)
        setTotalCount(local.length)
      }
    } catch (e) {
      console.error('useRounds reload failed:', e)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (status === 'loading') return
    reload()
  }, [status, reload])

  const saveRound = useCallback(
    async (round: LocalRound) => {
      if (isLoggedIn) {
        const res = await fetch('/api/rounds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(round),
        })
        if (!res.ok) {
          console.error('DB save failed, falling back to localStorage')
          saveToLocalStorage(round)
        } else {
          await reload()
        }
      } else {
        saveToLocalStorage(round)
        await reload()
      }
    },
    [isLoggedIn, reload]
  )

  const deleteRound = useCallback(
    async (roundId: string) => {
      if (isLoggedIn) {
        await fetch(`/api/rounds/${roundId}`, { method: 'DELETE' })
      } else {
        const raw = localStorage.getItem(STORAGE_KEY)
        const local: LocalRound[] = raw ? JSON.parse(raw) : []
        localStorage.setItem(STORAGE_KEY, JSON.stringify(local.filter((r) => r.id !== roundId)))
      }
      await reload()
    },
    [isLoggedIn, reload]
  )

  return { rounds, loading, isLimited, totalCount, saveRound, deleteRound, reload, isLoggedIn }
}

function saveToLocalStorage(round: LocalRound) {
  const raw = localStorage.getItem(STORAGE_KEY)
  const local: LocalRound[] = raw ? JSON.parse(raw) : []
  const idx = local.findIndex((r) => r.id === round.id)
  if (idx >= 0) {
    local[idx] = round
  } else {
    local.unshift(round)
  }
  if (local.length > 30) local.length = 30
  localStorage.setItem(STORAGE_KEY, JSON.stringify(local))
}

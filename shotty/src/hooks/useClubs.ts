'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { CLUB_ORDER } from '@/types'

const STORAGE_KEY = 'golfClubSet'
const DEFAULT_CLUBS = ['1W', 'UT', '7I', '8I', '9I', '56°', 'PW', 'SW', 'PT', '', '', '', '', '']

function sortClubs(arr: string[]): string[] {
  const filled = arr.filter((c) => c !== '')
  filled.sort((a, b) => {
    const ia = CLUB_ORDER.indexOf(a)
    const ib = CLUB_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return 0
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  return Array.from({ length: 14 }, (_, i) => filled[i] ?? '')
}

/**
 * ログイン中 → DB、未ログイン → localStorage を自動で切り替える。
 * 既存の { clubs, saveClubs, sortClubs } インタフェースを維持。
 */
export function useClubs() {
  const { data: session, status } = useSession()
  const isLoggedIn = !!session?.user?.id

  const [clubs, setClubs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [...DEFAULT_CLUBS]
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const arr = JSON.parse(saved)
        return sortClubs(Array.from({ length: 14 }, (_, i) => arr[i] ?? ''))
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_CLUBS]
  })

  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      if (isLoggedIn) {
        const res = await fetch('/api/clubs')
        if (res.ok) {
          const data = await res.json()
          const sorted = sortClubs(
            Array.from({ length: 14 }, (_, i) => (data.clubs as string[])[i] ?? '')
          )
          setClubs(sorted)
        }
      } else {
        const raw = localStorage.getItem(STORAGE_KEY)
        setClubs(raw ? sortClubs(JSON.parse(raw)) : [...DEFAULT_CLUBS])
      }
    } catch (e) {
      console.error('useClubs reload failed:', e)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (status === 'loading') return
    reload()
  }, [status, reload])

  const saveClubs = useCallback(
    async (arr: string[]) => {
      const sorted = sortClubs(arr)
      setClubs(sorted)
      // localStorage は常に更新（バックアップ）
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
      if (isLoggedIn) {
        await fetch('/api/clubs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clubs: sorted }),
        })
      }
    },
    [isLoggedIn]
  )

  return { clubs, loading, saveClubs, sortClubs, reload, isLoggedIn }
}

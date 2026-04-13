'use client'
import { useState } from 'react'
import { CLUB_ORDER } from '@/types'

const DEFAULT_CLUBS = ['1W','UT','7I','8I','9I','56°','PW','SW','PT','','','','','']

function sortClubs(arr: string[]): string[] {
  const filled = arr.filter(c => c !== '')
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

export function useClubs() {
  const [clubs, setClubs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [...DEFAULT_CLUBS]
    try {
      const saved = localStorage.getItem('golfClubSet')
      if (saved) {
        const arr = JSON.parse(saved)
        return sortClubs(Array.from({ length: 14 }, (_, i) => arr[i] ?? ''))
      }
    } catch {
      // ignore parse errors
    }
    return [...DEFAULT_CLUBS]
  })

  const saveClubs = (arr: string[]) => {
    const sorted = sortClubs(arr)
    setClubs(sorted)
    localStorage.setItem('golfClubSet', JSON.stringify(sorted))
  }

  return { clubs, saveClubs, sortClubs }
}

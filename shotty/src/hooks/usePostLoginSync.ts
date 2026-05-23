'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { migrateLocalToDb, isAlreadySynced } from '@/lib/migrate-local-to-db'

/**
 * ログイン状態になった瞬間、localStorage のデータを DB に自動移行する。
 * 既に同期済みなら何もしない。
 */
export function usePostLoginSync() {
  const { status } = useSession()
  const [syncState, setSyncState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ rounds: number; clubs: number } | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return
    if (typeof window === 'undefined') return
    if (isAlreadySynced()) return
    if (syncState !== 'idle') return

    ;(async () => {
      setSyncState('running')
      const r = await migrateLocalToDb()
      if (r.ok) {
        setSyncState('done')
        setResult({ rounds: r.importedRounds, clubs: r.importedClubs })
      } else {
        setSyncState('error')
        console.error('Migration failed:', r.error)
      }
    })()
  }, [status, syncState])

  return { syncState, result }
}

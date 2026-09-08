'use client'

import { useEffect, useState } from 'react'

/**
 * 一定間隔で再レンダリングを促し、戻り値の関数で即時更新もできる。
 *
 * ラウンド状態は golf/state.ts のミュータブルオブジェクトが持っており
 * React の購読対象にならないため、表示側はポーリングで読み直す。
 */
export function useTick(intervalMs: number): () => void {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return () => setTick(t => t + 1)
}

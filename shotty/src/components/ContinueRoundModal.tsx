'use client'

import { useEffect, useState } from 'react'
import { hasInProgressRound, getInProgressRoundInfo, type InProgressRoundInfo } from '@/lib/continue-round'
import { clearActiveRound, renderStrip, loadHole, updateHoleNavBtns } from '@/app/golf/logic'
import { gs } from '@/app/golf/state'

type Props = {
  onContinue: () => void
  onNew: () => void
}

export default function ContinueRoundModal({ onContinue, onNew }: Props) {
  const [info, setInfo] = useState<InProgressRoundInfo | null>(null)

  useEffect(() => {
    // initApp() による自動復元後にチェック（少し遅延して確実に取得）
    const timer = setTimeout(() => {
      if (hasInProgressRound()) {
        setInfo(getInProgressRoundInfo())
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (!info) return null

  const handleContinue = () => {
    setInfo(null)
    onContinue()
  }

  const handleNew = () => {
    clearActiveRound()
    gs.roundShots = {}
    gs.roundId = 'round_' + Date.now()
    renderStrip()
    loadHole()
    updateHoleNavBtns()
    setInfo(null)
    onNew()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 250,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#0d1f0d', border: '1px solid #f97316',
        borderRadius: 16, padding: 24, maxWidth: 340, width: '100%', color: 'white',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏌️</div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>進行中のラウンドがあります</h2>
        </div>

        <div style={{
          background: 'rgba(17,24,39,0.6)', borderRadius: 10,
          padding: '12px 14px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{info.date}</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{info.gcName}</div>
          <div style={{ color: '#d1d5db', fontSize: 13 }}>{info.courseLabel}</div>
          <div style={{ color: '#fb923c', marginTop: 4, fontSize: 13 }}>
            {info.completedHoles}/18 ホール記録済み
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleContinue}
            style={{
              width: '100%', background: '#f97316', color: 'white',
              fontWeight: 600, padding: '12px 0', borderRadius: 10,
              border: 'none', cursor: 'pointer', fontSize: 15,
            }}
          >
            続きから記録
          </button>
          <button
            onClick={handleNew}
            style={{
              width: '100%', background: '#1f2937', color: '#d1d5db',
              padding: '12px 0', borderRadius: 10,
              border: 'none', cursor: 'pointer', fontSize: 15,
            }}
          >
            新しく始める
          </button>
        </div>
      </div>
    </div>
  )
}

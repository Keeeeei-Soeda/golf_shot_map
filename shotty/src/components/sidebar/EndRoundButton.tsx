'use client'

import { useState } from 'react'

type Props = {
  completedHoles: number
  onConfirm: () => void
}

export default function EndRoundButton({ completedHoles, onConfirm }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="menu-club-btn"
        style={{
          display: 'block', width: '100%', marginTop: 16,
          background: 'rgba(127,29,29,0.4)',
          border: '1px solid #b91c1c',
          color: '#fca5a5',
        }}
      >
        🛑 ラウンドを途中終了
      </button>

      {confirmOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: '#0d1f0d', border: '1px solid #b91c1c',
            borderRadius: 16, padding: 24, maxWidth: 340, width: '100%', color: 'white',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛑</div>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>ラウンドを終了しますか？</h2>
            </div>
            <p style={{ fontSize: 14, color: '#d1d5db', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
              ここまでの記録（{completedHoles}ホール分）が保存されます。
              <br />
              <span style={{ fontSize: 11, color: '#6b7280' }}>※ この操作は取り消せません</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => {
                  setConfirmOpen(false)
                  onConfirm()
                }}
                style={{
                  width: '100%', background: '#dc2626', color: 'white',
                  fontWeight: 600, padding: '12px 0', borderRadius: 10,
                  border: 'none', cursor: 'pointer', fontSize: 15,
                }}
              >
                終了して保存
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  width: '100%', background: '#1f2937', color: '#d1d5db',
                  padding: '12px 0', borderRadius: 10,
                  border: 'none', cursor: 'pointer', fontSize: 15,
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

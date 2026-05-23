'use client'

import { usePostLoginSync } from '@/hooks/usePostLoginSync'
import { useEffect, useState } from 'react'

export default function SyncToast() {
  const { syncState, result } = usePostLoginSync()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (syncState === 'running' || syncState === 'done') {
      setVisible(true)
      if (syncState === 'done') {
        const t = setTimeout(() => setVisible(false), 4000)
        return () => clearTimeout(t)
      }
    }
  }, [syncState])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 200,
      maxWidth: 280, background: '#111827',
      border: '1px solid #f97316', borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,.6)',
      padding: '12px 16px', color: 'white',
    }}>
      {syncState === 'running' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '2px solid #f97316', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 14 }}>クラウドに保存中...</span>
        </div>
      )}
      {syncState === 'done' && result && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>☁️ クラウド保存完了</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            ラウンド {result.rounds}件、クラブセット {result.clubs > 0 ? '1件' : 'なし'}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

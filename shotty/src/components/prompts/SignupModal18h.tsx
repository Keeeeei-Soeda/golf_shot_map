'use client'

import { useSession, signIn } from 'next-auth/react'

type Props = {
  visible: boolean
  /** "complete" = 18ホール完了 / "midway" = 途中終了 */
  reason: 'complete' | 'midway'
  completedHoles: number
  totalScore: number
  gcName: string
  onClose: () => void
}

export default function SignupModal18h({
  visible, reason, completedHoles, totalScore, gcName, onClose,
}: Props) {
  const { status } = useSession()
  if (!visible) return null

  const isComplete = reason === 'complete'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#0d1f0d', border: '1px solid #f97316',
        borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', color: 'white',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{isComplete ? '🏌️' : '📍'}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            {isComplete ? 'ナイスラウンド！' : 'ラウンドを保存'}
          </h2>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>
            {gcName}・{completedHoles}ホール
            {isComplete && <>・スコア {totalScore}</>}
          </p>
        </div>

        {status !== 'authenticated' ? (
          <>
            <p style={{ fontSize: 14, color: '#d1d5db', textAlign: 'center', marginBottom: 8, lineHeight: 1.6 }}>
              認証するとラウンドの記録が残ります
            </p>
            <ul style={{ fontSize: 12, color: '#6b7280', marginBottom: 20, paddingLeft: 0, listStyle: 'none', lineHeight: 1.8 }}>
              <li>✓ 過去のラウンドと比較できる</li>
              <li>✓ 機種変しても消えない</li>
              <li>✓ 複数の端末で見られる</li>
            </ul>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => signIn('line', { callbackUrl: '/' })}
                style={{
                  width: '100%', background: '#06C755', color: 'white',
                  fontWeight: 600, padding: '12px 0', borderRadius: 10,
                  border: 'none', cursor: 'pointer', fontSize: 15,
                }}
              >
                💚 LINE で保存
              </button>
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                style={{
                  width: '100%', background: 'white', color: 'black',
                  fontWeight: 600, padding: '12px 0', borderRadius: 10,
                  border: 'none', cursor: 'pointer', fontSize: 15,
                }}
              >
                🔵 Google で保存
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%', marginTop: 16,
                fontSize: 13, color: '#9ca3af',
                background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
              }}
            >
              後で
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, color: '#d1d5db', textAlign: 'center', marginBottom: 16 }}>
              ☁️ クラウドに保存されました
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%', background: '#f97316', color: 'white',
                fontWeight: 600, padding: '12px 0', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontSize: 15,
              }}
            >
              閉じる
            </button>
          </>
        )}
      </div>
    </div>
  )
}

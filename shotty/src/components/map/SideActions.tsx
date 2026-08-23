'use client'

import { useEffect, useRef, useState } from 'react'
import {
  hasData, hole, openCupPanel, recordCurrentGps, showTeeToCenter,
  type GpsRecordStatus,
} from '@/app/golf/logic'
import { useTick } from '@/hooks/useTick'

/** getCurrentPosition が応答しない環境でも状態を復帰させるための保険 */
const GPS_GIVE_UP_MS = 13000

/**
 * 右サイドの操作ボタン。3つとも同径の正円で、優先度は形ではなく色で表す。
 *
 * 並び順は上から 測定ON → パット → 現在地で記録 とし、
 * メインの「現在地で記録」を最下段に置いて親指が届きやすい位置にする。
 */
export default function SideActions() {
  useTick(1000)

  const [gpsStatus, setGpsStatus] = useState<GpsRecordStatus | 'idle'>('idle')
  const [gpsError, setGpsError] = useState<string | null>(null)
  const giveUpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (giveUpTimer.current) clearTimeout(giveUpTimer.current)
  }, [])

  const handleGpsStatus = (status: GpsRecordStatus, message?: string) => {
    if (giveUpTimer.current) clearTimeout(giveUpTimer.current)
    setGpsStatus(status)
    setGpsError(status === 'error' ? message ?? '位置情報を取得できませんでした' : null)

    if (status === 'pending') {
      giveUpTimer.current = setTimeout(() => {
        setGpsStatus('error')
        setGpsError('位置情報が応答しません。ブラウザの位置情報を許可してください')
      }, GPS_GIVE_UP_MS)
    }
  }

  const h = hole()
  if (!h || !hasData(h)) return null

  const isPending = gpsStatus === 'pending'

  return (
    <div className="side-actions">
      {gpsError && (
        <div className="side-action-error" role="alert">{gpsError}</div>
      )}

      <div className="side-action">
        <button
          className="side-action-btn is-record"
          onClick={() => recordCurrentGps(handleGpsStatus)}
          disabled={isPending}
          aria-label="現在地でショットを記録"
        >
          {isPending ? '⌛' : '✏️'}
        </button>
        <span className="side-action-label">
          {isPending ? '取得中…' : '現在地で記録'}
        </span>
      </div>

      <div className="side-action">
        <button
          className="side-action-btn is-putt"
          onClick={openCupPanel}
          aria-label="パット数とスコアを登録してホールを確定"
        >
          ⛳
        </button>
        <span className="side-action-label">パット数記録</span>
      </div>

      <div className="side-action">
        <button
          className="side-action-btn is-measure"
          onClick={showTeeToCenter}
          aria-label="ティーからセンターまでの距離を表示"
        >
          📏
        </button>
        <span className="side-action-label">T→C距離</span>
      </div>
    </div>
  )
}

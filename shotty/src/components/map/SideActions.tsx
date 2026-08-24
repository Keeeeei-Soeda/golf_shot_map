'use client'

import { useEffect, useRef, useState } from 'react'
import {
  hasData, hole, isMapPlayActive, openCupPanel, recordCurrentGps, rotateToHole, showTeeToCenter,
  type GpsRecordStatus,
} from '@/app/golf/logic'
import { useTick } from '@/hooks/useTick'

/** getCurrentPosition が応答しない環境でも状態を復帰させるための保険 */
const GPS_GIVE_UP_MS = 13000

/**
 * 右サイドの操作ボタン。
 * 上：アクション群（記録・パット・測定）／下：マップ操作（地図回転）
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
        setGpsError('位置情報が応答しません。地図を長押しして記録できます')
      }, GPS_GIVE_UP_MS)
    }
  }

  const h = hole()
  if (!h || !hasData(h) || !isMapPlayActive()) return null

  const isPending = gpsStatus === 'pending'

  return (
    <div className="side-actions">
      {gpsError && (
        <div className="side-action-error" role="alert">{gpsError}</div>
      )}

      <div className="side-actions-group" role="group" aria-label="プレー操作">
        <div className="side-action">
          <button
            className="side-action-btn is-record"
            onClick={() => recordCurrentGps(handleGpsStatus)}
            disabled={isPending}
            aria-label="現在地で記録"
          >
            {isPending ? (
              '⌛'
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src="/icons/icon-pin.png" alt="" className="side-action-icon" width={30} height={30} />
            )}
          </button>
          <span className="side-action-label">
            {isPending ? '取得中…' : '現在地で記録'}
          </span>
        </div>

        <div className="side-action">
          <button
            className="side-action-btn is-putt"
            onClick={openCupPanel}
            aria-label="パット数記録"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-putter.png" alt="" className="side-action-icon" width={30} height={30} />
          </button>
          <span className="side-action-label">パット数記録</span>
        </div>

        <div className="side-action">
          <button
            className="side-action-btn is-measure"
            onClick={showTeeToCenter}
            aria-label="ヤード測定"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-ruler.png" alt="" className="side-action-icon" width={30} height={30} />
          </button>
          <span className="side-action-label">ヤード測定</span>
        </div>
      </div>

      <div className="side-actions-divider" aria-hidden />

      <div className="side-actions-group" role="group" aria-label="マップ操作">
        <div className="side-action">
          <button
            type="button"
            id="rotateBtn"
            className="side-action-btn is-rotate"
            onClick={rotateToHole}
            aria-label="地図をホール方向に回転"
            title="ホール方向に回転"
          >
            🧭
          </button>
          <span className="side-action-label">地図回転</span>
        </div>
      </div>
    </div>
  )
}

'use client'

import { hasData, hole, isMapPlayActive, startGPS } from '@/app/golf/logic'
import { gs } from '@/app/golf/state'
import { useTick } from '@/hooks/useTick'
import { haversineYards } from '@/lib/geo'

type GeoPoint = { lat: number; lng: number }
type PinKey = 'front' | 'center' | 'back'

function toGeoPoint(value: unknown): GeoPoint | null {
  if (!value || typeof value !== 'object') return null
  const { lat, lng } = value as { lat?: unknown; lng?: unknown }
  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null
}

/** GPS 追尾マーカーから現在地を読む。未取得なら null。 */
function currentGpsPoint(): GeoPoint | null {
  const pos = gs.gpsMarker?.getPosition?.()
  if (!pos) return null
  const lat: unknown = pos.lat()
  const lng: unknown = pos.lng()
  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null
}

/** 測距の基準ピン。ピンをタップして切り替えるまではセンター。 */
function selectedPinKey(): PinKey {
  const selected = gs.measureSelectedPin
  return selected === 'front' || selected === 'back' ? selected : 'center'
}

function PinRefLabel({ pinKey }: { pinKey: PinKey }) {
  if (pinKey === 'center') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/icons/pin.png" alt="ピン" className="dist-card-pin" width={14} height={14} />
    )
  }
  return <>{pinKey === 'front' ? 'F' : 'B'}</>
}

/**
 * 左上に常時表示する残り距離カード。
 * 向きは「現在地 → 選択リファレンス」であり、飛距離ではない。
 */
export default function DistanceCard() {
  useTick(1000)

  const h = hole()
  if (!h || !hasData(h) || !isMapPlayActive()) return null

  const pinKey = selectedPinKey()
  const target = toGeoPoint(h[pinKey])
  const here = currentGpsPoint()
  const yards =
    here && target ? haversineYards(here.lat, here.lng, target.lat, target.lng) : null

  const ariaTarget = pinKey === 'center' ? 'ピン' : pinKey === 'front' ? 'F' : 'B'

  return (
    <button
      className="dist-card"
      onClick={() => { if (!gs.gpsActive) startGPS() }}
      aria-label={`現在地から${ariaTarget}までの残り距離`}
    >
      <span className="dist-card-label">
        現在地 → <PinRefLabel pinKey={pinKey} />
      </span>
      <span className="dist-card-value">
        {yards === null ? <span className="dist-card-empty">--</span> : yards}
        <span className="dist-card-unit">yd</span>
      </span>
      {yards === null && <span className="dist-card-hint">タップしてGPS取得</span>}
    </button>
  )
}

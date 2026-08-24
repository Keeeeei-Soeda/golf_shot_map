'use client'

import {
  activeTee, course, curShots, hasData, hole, isPairRound, nextHole, prevHole, totalHoles,
} from '@/app/golf/logic'
import { st } from '@/app/golf/state'
import { useTick } from '@/hooks/useTick'
import { haversineYards } from '@/lib/geo'

function readNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

/** 打点（未記録ならティー）からセンターまでのヤード。F/B は出さない。 */
function yardsToCenter(): number | null {
  const h = hole()
  if (!h || !hasData(h)) return null
  const center = h.center as { lat?: unknown; lng?: unknown } | undefined
  if (typeof center?.lat !== 'number' || typeof center?.lng !== 'number') return null

  const shots = curShots()
  let fromLat: number
  let fromLng: number
  if (shots.length === 0) {
    const tee = activeTee(h) as { lat?: unknown; lng?: unknown } | null
    if (typeof tee?.lat !== 'number' || typeof tee?.lng !== 'number') return null
    fromLat = tee.lat
    fromLng = tee.lng
  } else {
    const last = shots[shots.length - 1] as { lat?: unknown; lng?: unknown }
    if (typeof last.lat !== 'number' || typeof last.lng !== 'number') return null
    fromLat = last.lat
    fromLng = last.lng
  }
  return haversineYards(fromLat, fromLng, center.lat, center.lng)
}

/**
 * 下部バー。ホール送り・ホール番号・→Cヤード（PARの上）。
 */
export default function HoleBar() {
  const refresh = useTick(1000)

  const hasCourse = !!course()
  const h = hole()
  const last = totalHoles() - 1
  const displayNo = isPairRound() ? st.hIdx + 1 : readNumber(h?.no)
  const par = readNumber(h?.par)
  const toCenter = yardsToCenter()

  const go = (move: () => void) => {
    move()
    refresh()
  }

  return (
    <div id="bottomBar">
      <div
        id="holeNavBtns"
        className="hole-nav"
        style={{ display: hasCourse ? 'flex' : 'none' }}
      >
        <button
          id="prevHoleBtn"
          className="hole-nav-btn"
          onClick={() => go(prevHole)}
          disabled={st.hIdx <= 0}
          aria-label="前のホール"
        >
          ◀
        </button>
        <div className="hole-label">
          <span id="holeYardage" className="hole-label-yd" aria-label="センターまでのヤード">
            {toCenter === null ? '— yd' : `${toCenter} yd`}
          </span>
          <div className="hole-label-row">
            <span className="hole-label-no">H{displayNo ?? '—'}</span>
            <span className="hole-label-par">PAR {par ?? '—'}</span>
          </div>
        </div>
        <button
          id="nextHoleBtn"
          className="hole-nav-btn"
          onClick={() => go(nextHole)}
          disabled={st.hIdx >= last}
          aria-label="次のホール"
        >
          ▶
        </button>
      </div>
    </div>
  )
}

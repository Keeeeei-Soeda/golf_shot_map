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

/** st.teeType → courses の yards キー */
function yardsKeyForTee(): 'reg' | 'ladies' | 'back' {
  if (st.teeType === 'ladies') return 'ladies'
  if (st.teeType === 'back') return 'back'
  return 'reg'
}

/**
 * 未ショット時はスコアカード公式ヤード（レディース選択なら yards.ladies）。
 * ショット後は打点→センターの実測。
 */
function displayYardage(): number | null {
  const h = hole()
  if (!h || !hasData(h)) return null

  const shots = curShots()
  if (shots.length === 0) {
    const yards = h.yards as Record<string, unknown> | undefined
    const key = yardsKeyForTee()
    const official = yards?.[key]
    if (typeof official === 'number') return official
    // 公式が無い場合のみ GPS ティー→C
    const center = h.center as { lat?: unknown; lng?: unknown } | undefined
    const tee = activeTee(h) as { lat?: unknown; lng?: unknown } | null
    if (
      typeof center?.lat === 'number' && typeof center?.lng === 'number' &&
      typeof tee?.lat === 'number' && typeof tee?.lng === 'number'
    ) {
      return haversineYards(tee.lat, tee.lng, center.lat, center.lng)
    }
    return null
  }

  const center = h.center as { lat?: unknown; lng?: unknown } | undefined
  const last = shots[shots.length - 1] as { lat?: unknown; lng?: unknown }
  if (
    typeof center?.lat !== 'number' || typeof center?.lng !== 'number' ||
    typeof last.lat !== 'number' || typeof last.lng !== 'number'
  ) return null
  return haversineYards(last.lat, last.lng, center.lat, center.lng)
}

/**
 * 下部バー。H / PAR / ヤードを同一行（同じレベル）に並べる。
 */
export default function HoleBar() {
  const refresh = useTick(500)

  const hasCourse = !!course()
  const h = hole()
  const last = totalHoles() - 1
  const displayNo = isPairRound() ? st.hIdx + 1 : readNumber(h?.no)
  const par = readNumber(h?.par)
  // teeType を読んで、レディース切替直後も再描画の依存にする
  const teeType = st.teeType
  const toCenter = displayYardage()

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
          <span className="hole-label-no">H{displayNo ?? '—'}</span>
          <span className="hole-label-par">PAR {par ?? '—'}</span>
          <span
            id="holeYardage"
            className="hole-label-yd"
            aria-label="センターまでのヤード"
            data-tee={teeType}
          >
            {toCenter === null ? '— yd' : `${toCenter} yd`}
          </span>
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

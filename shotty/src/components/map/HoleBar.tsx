'use client'

import { course, hole, isPairRound, nextHole, prevHole, totalHoles } from '@/app/golf/logic'
import { st } from '@/app/golf/state'
import { useTick } from '@/hooks/useTick'

function readNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

/**
 * 下部バー。ホール送りとホール番号のみを置き、他の操作は混在させない。
 *
 * 表示・活性の判定は st / logic の値から都度計算するため、
 * logic.ts 側の updateHoleNavBtns と競合しない（同じ結果を書くだけ）。
 */
export default function HoleBar() {
  const refresh = useTick(1000)

  const hasCourse = !!course()
  const h = hole()
  const last = totalHoles() - 1
  const displayNo = isPairRound() ? st.hIdx + 1 : readNumber(h?.no)
  const par = readNumber(h?.par)

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

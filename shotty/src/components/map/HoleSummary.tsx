'use client'

import { closeHoleSummary } from '@/app/golf/logic'

export default function HoleSummary() {
  return (
    <div id="holeSummaryPanel">
      <div className="hs-header">
        <div>
          <div className="hs-title">ホールサマリー</div>
          <div id="hsHoleInfo" className="hs-hole-info"></div>
          <div id="hsScore" className="hs-score-badge"></div>
        </div>
      </div>
      <div className="hs-body">
        <div className="hs-section-title">📍 ショット詳細</div>
        <div id="hsShotList" suppressHydrationWarning></div>
        <div className="hs-section-title">📊 スコアカード</div>
        <div id="hsScoreCard" suppressHydrationWarning></div>
      </div>
      <div className="hs-footer">
        <button className="hs-next-btn" onClick={closeHoleSummary}>次のホールへ ▶</button>
      </div>
    </div>
  )
}

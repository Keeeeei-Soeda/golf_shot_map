'use client'

import { closeReview, clearHoleShots } from '@/app/golf/logic'

export default function ReviewPanel() {
  return (
    <>
      <div id="reviewOverlay" onClick={closeReview}></div>
      <div id="reviewPanel">
        <div id="rvTitle" className="rv-title" suppressHydrationWarning>ショット履歴</div>
        <div style={{marginBottom:'8px'}}>
          <button className="sp-cancel" style={{fontSize:'11px'}} onClick={clearHoleShots}>このホールのショットをすべて削除</button>
        </div>
        <div id="rvList" suppressHydrationWarning></div>
      </div>
    </>
  )
}

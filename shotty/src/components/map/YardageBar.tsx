'use client'

import { rotateToHole, toggleYardageInfo } from '@/app/golf/logic'

/** マップ操作ボタン群 + F/C/B ヤード表示パネル */
export default function YardageBar() {
  return (
    <>
      {/* 現在地の記録は右サイドの SideActions に移設済み */}
      <div id="mapBtns" className="map-btns" style={{display:'none'}}>
        <button id="rotateBtn" className="rotate-btn" onClick={rotateToHole} title="ホール方向に回転">⛳↑</button>
        <button id="yiToggleBtn" className="yi-toggle-btn" onClick={toggleYardageInfo} title="ヤード情報">T</button>
      </div>
      <div id="yardageInfo" style={{display:'none'}} suppressHydrationWarning></div>
    </>
  )
}

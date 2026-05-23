'use client'

import { recordCurrentGps, rotateToHole, toggleYardageInfo } from '@/app/golf/logic'

/** マップ操作ボタン群 + F/C/B ヤード表示パネル */
export default function YardageBar() {
  return (
    <>
      <div id="mapBtns" className="map-btns" style={{display:'none'}}>
        <button id="gpsRecBtn" className="gps-rec-btn" onClick={recordCurrentGps} title="現在地を記録">✏️</button>
        <button id="rotateBtn" className="rotate-btn" onClick={rotateToHole} title="ホール方向に回転">⛳↑</button>
        <button id="yiToggleBtn" className="yi-toggle-btn" onClick={toggleYardageInfo} title="ヤード情報">T</button>
      </div>
      <div id="yardageInfo" style={{display:'none'}} suppressHydrationWarning></div>
    </>
  )
}

'use client'

import { closeCupPanel, selectCupPutts, confirmCupIn } from '@/app/golf/logic'

export default function CupPanel() {
  return (
    <div id="cupPanel">
      <div className="cup-title">⛳ カップイン</div>
      <div className="cup-score-area">
        <div id="cpHoleInfo" className="cup-hole-info">—</div>
        <div id="cpShots" className="cup-shots">0<span>打</span></div>
        <div id="cpScoreLabel" className="cup-score-label"></div>
      </div>
      <div className="cup-manual">
        <div className="cup-manual-title">スコアを確認・変更</div>
        <div id="cpScoreBtns" className="cup-manual-btns" suppressHydrationWarning></div>
      </div>
      <div className="cup-putts-area">
        <div className="cup-putts-label">パット数（任意）</div>
        <div className="cup-putts-btns">
          {[1,2,3,4].map(n=>(
            <button key={n} className="cup-putts-btn" data-putts={String(n)} onClick={e=>selectCupPutts(e.currentTarget as HTMLElement,n)}>{n}パット</button>
          ))}
        </div>
      </div>
      <div className="cup-btns">
        <button className="cup-cancel" onClick={closeCupPanel}>キャンセル</button>
        <button className="cup-ok" onClick={confirmCupIn}>⛳ 確定</button>
      </div>
    </div>
  )
}

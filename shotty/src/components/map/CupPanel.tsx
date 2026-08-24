'use client'

import { closeCupPanel, selectCupPutts, confirmCupIn } from '@/app/golf/logic'

/**
 * パット・スコア登録パネル。
 * パット数とスコア（パー差）を選び、確定後はホールサマリーへ。
 * confirmCupIn の保存ロジックは既存のまま流用する。
 */
export default function CupPanel() {
  return (
    <div id="cupPanel">
      <div className="cup-title">パット数・スコア記録</div>
      <div className="cup-score-area">
        <div id="cpHoleInfo" className="cup-hole-info">—</div>
        <div id="cpShots" className="cup-shots">—<span>打</span></div>
        <div id="cpScoreLabel" className="cup-score-label"></div>
        <span id="cpRecordedPenaltyBadge" style={{ display: 'none' }}></span>
      </div>

      <div className="cup-putts-area">
        <div className="cup-putts-label">パット数</div>
        <div className="cup-putts-btns">
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              type="button"
              className="cup-putts-btn"
              data-putts={String(n)}
              onClick={e => selectCupPutts(e.currentTarget as HTMLElement, n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="cup-putts-btn"
            data-putts="5"
            onClick={e => selectCupPutts(e.currentTarget as HTMLElement, 5)}
          >
            5+
          </button>
        </div>
      </div>

      <div className="cup-manual">
        <div className="cup-manual-title">スコア（ショットがあれば自動・変更可）</div>
        <div id="cpScoreBtns" className="cup-manual-btns" suppressHydrationWarning></div>
      </div>

      <div className="cup-btns">
        <button type="button" className="cup-cancel" onClick={closeCupPanel}>キャンセル</button>
        <button id="cpOkBtn" type="button" className="cup-ok" onClick={confirmCupIn}>
          確定する
        </button>
      </div>
    </div>
  )
}

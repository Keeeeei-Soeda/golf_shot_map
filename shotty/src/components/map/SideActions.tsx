'use client'

import { clearMeasure, hasData, hole, openCupPanel, recordCurrentGps } from '@/app/golf/logic'
import { useTick } from '@/hooks/useTick'

/**
 * 右サイドの操作ボタン。3つとも同径の正円で、優先度は形ではなく色で表す。
 *
 * 並び順は上から 測定ON → パット → 現在地で記録 とし、
 * メインの「現在地で記録」を最下段に置いて親指が届きやすい位置にする。
 */
export default function SideActions() {
  useTick(1000)

  const h = hole()
  if (!h || !hasData(h)) return null

  return (
    <div className="side-actions">
      <div className="side-action">
        <button
          className="side-action-btn is-measure"
          onClick={clearMeasure}
          aria-label="測定中（タップで測距をリセット）"
        >
          📏
        </button>
        <span className="side-action-label">測定ON</span>
      </div>

      <div className="side-action">
        <button
          className="side-action-btn is-putt"
          onClick={openCupPanel}
          aria-label="パット・スコアを登録"
        >
          ⛳
        </button>
        <span className="side-action-label">パット</span>
      </div>

      <div className="side-action">
        <button
          className="side-action-btn is-record"
          onClick={recordCurrentGps}
          aria-label="現在地でショットを記録"
        >
          ✏️
        </button>
        <span className="side-action-label">現在地で記録</span>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import {
  cancelShot, clearHoleShots, confirmShot,
  selectPenalty, selectShotObType, useReteePosition,
  confirmPenaltyDrop, cancelPenalty, toggleReview,
} from '@/app/golf/logic'
import { ShotTagPicker, type ShotTagState } from './ShotTagPicker'

const OB_TYPES = [
  { type: 'ペナルティエリア', icon: '🏊', desc: '池・川など' },
  { type: 'アンプレヤブル', icon: '🌳', desc: '打てない場所' },
  { type: '紛失球', icon: '🔍', desc: 'ロストボール' },
  { type: 'OB', icon: '🚫', desc: '白杭・黄杭外' },
] as const

const DEFAULT_TAGS: ShotTagState = { isOB: false, shotType: null, shotFeel: null }

/**
 * ショット登録パネル（全画面）。
 * クラブ選択＋打感（任意）が主。ペナルティ・OBは常時表示。
 * confirmShot 等の既存ロジックはそのまま流用する。
 */
export default function ShotPanel() {
  const [tags, setTags] = useState<ShotTagState>(DEFAULT_TAGS)
  /** selectClub は DOM 操作のため、再レンダーで disabled が戻らないよう React 側で同期する */
  const [canSubmit, setCanSubmit] = useState(false)

  useEffect(() => {
    const panel = document.getElementById('shotPanel')
    if (!panel) return

    const observer = new MutationObserver(() => {
      if (panel.classList.contains('open')) {
        setTags(DEFAULT_TAGS)
        setCanSubmit(false)
      }
    })
    observer.observe(panel, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // clubGrid の .cb.sel を監視（logic.selectClub が付与）
  useEffect(() => {
    const grid = document.getElementById('clubGrid')
    if (!grid) return
    const sync = () => setCanSubmit(!!grid.querySelector('.cb.sel'))
    const observer = new MutationObserver(sync)
    observer.observe(grid, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true })
    return () => observer.disconnect()
  }, [])

  // タグが変わるたびに window.__shotTags に同期（confirmShot から参照）
  useEffect(() => {
    ;(window as unknown as { __shotTags: ShotTagState }).__shotTags = tags
  }, [tags])

  const handleClear = () => {
    if (!confirm('このホールのショットをすべて削除しますか？')) return
    clearHoleShots()
  }

  return (
    <div id="shotPanel">
      <div className="sp-header">
        <div>
          <div id="spShotNo" className="sp-shotno">1打目を登録</div>
          <div className="sp-hint">現在地を記録地点として登録します</div>
        </div>
        <div className="sp-header-tools">
          <button type="button" className="sp-tool-btn" onClick={toggleReview} title="ショット一覧" aria-label="ショット一覧">
            📋
          </button>
          <button type="button" className="sp-tool-btn" onClick={handleClear} title="このホールをクリア" aria-label="このホールをクリア">
            ↺
          </button>
          <button type="button" className="sp-close" onClick={cancelShot} aria-label="閉じる">✕</button>
        </div>
      </div>

      {/* 打点からの距離（パネルに載せるのは進んだ距離） */}
      <div className="sp-carry-summary">
        <div className="sp-carry-label">打点からの距離</div>
        <div id="spCarryFrom" className="sp-carry-from">—</div>
        <div id="spCarryYd" className="sp-carry-yd">—<span>yd</span></div>
      </div>

      <div className="sp-section-label">クラブ</div>
      <div id="clubGrid" className="club-grid" suppressHydrationWarning></div>

      <div className="sp-section-label">打感（任意・スキップ可）</div>
      <ShotTagPicker value={tags} onChange={setTags} />

      {/* ペナルティ・OB（常時表示・既存ロジックの DOM id を維持） */}
      <div className="sp-section-label">⚠️ ペナルティ・OB</div>
      <div id="spBodyPenalty" className="sp-penalty-body">
        <div id="spPenaltyStatus" className="sp-penalty-status">OBの場合: 次の打数を選択 → 登録</div>
        <div id="spPenaltyTeeSection">
          <div className="sp-penalty-title">OB後の打数を選択</div>
          <div className="sp-penalty-btns">
            <button id="pbBtn3" className="pb" onClick={() => selectPenalty(3)}>プレ3<small>3打目から</small></button>
            <button id="pbBtn4" className="pb" onClick={() => selectPenalty(4)}>プレ4<small>4打目から</small></button>
            <button id="pbBtn5" className="pb" onClick={() => selectPenalty(5)}>プレ5<small>5打目から</small></button>
          </div>
          <div className="sp-ob-type-label">ペナルティ種別（任意）</div>
          <div className="sp-ob-type-btns">
            {OB_TYPES.map(ob => (
              <button
                key={ob.type}
                className="sp-ob-btn"
                data-type={ob.type}
                onClick={e => selectShotObType(e.currentTarget as HTMLElement, ob.type)}
              >
                {ob.icon} {ob.type}<small>{ob.desc}</small>
              </button>
            ))}
          </div>
        </div>
        <div id="spPenaltyHazardSection" style={{ display: 'none' }}>
          <div className="sp-ob-type-label">ペナルティ種別（任意）</div>
          <div className="sp-ob-type-btns">
            {OB_TYPES.map(ob => (
              <button
                key={ob.type}
                className="sp-ob-btn"
                data-type={ob.type}
                onClick={e => selectShotObType(e.currentTarget as HTMLElement, ob.type)}
              >
                {ob.icon} {ob.type}<small>{ob.desc}</small>
              </button>
            ))}
          </div>
          <div className="sp-penalty-info">1打罰を自動加算して記録します</div>
          <div className="sp-retee-area">
            <div className="sp-retee-label">OB・紛失球の場合（打ち直し）</div>
            <button type="button" className="sp-retee-btn" onClick={useReteePosition}>↩ 前の打点に戻る（打ち直し）</button>
          </div>
        </div>
        <div className="sp-btns" style={{ marginTop: 8 }}>
          <button id="spPenaltyOkBtn" className="sp-ok" onClick={confirmPenaltyDrop}>📍 ここに登録する</button>
          <button type="button" className="sp-cancel" onClick={cancelPenalty}>↺ リセット</button>
        </div>
      </div>

      {/* switchSpTab / updateSpDistTab 互換用（非表示） */}
      <div id="spTabRecord" style={{ display: 'none' }} />
      <div id="spTabPenalty" style={{ display: 'none' }} />
      <div id="spTabDist" style={{ display: 'none' }} />
      <div id="spBodyRecord" style={{ display: 'none' }} />
      <div id="spBodyDist" style={{ display: 'none' }} />

      <div className="sp-btns sp-btns-main">
        <button type="button" className="sp-cancel" onClick={cancelShot}>キャンセル</button>
        <button
          id="spOkBtn"
          className="sp-ok"
          type="button"
          onClick={confirmShot}
          disabled={!canSubmit}
        >
          登録する
        </button>
      </div>
    </div>
  )
}

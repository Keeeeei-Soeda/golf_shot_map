'use client'

import { useState, useEffect } from 'react'
import {
  cancelShot, switchSpTab, confirmShot,
  selectPenalty, selectShotObType, useReteePosition,
  confirmPenaltyDrop, cancelPenalty,
} from '@/app/golf/logic'
import { ShotTagPicker, type ShotTagState } from './ShotTagPicker'

const OB_TYPES = [
  { type:'ペナルティエリア', icon:'🏊', desc:'池・川など' },
  { type:'アンプレヤブル',   icon:'🌳', desc:'打てない場所' },
  { type:'紛失球',           icon:'🔍', desc:'ロストボール' },
  { type:'OB',               icon:'🚫', desc:'白杭・黄杭外' },
]

const DEFAULT_TAGS: ShotTagState = { isOB: false, shotType: null, shotFeel: null }

export default function ShotPanel() {
  const [tags, setTags] = useState<ShotTagState>(DEFAULT_TAGS)

  // パネルが開くたびにタグをリセット（logic.ts の openShotPanelUI に相当）
  useEffect(() => {
    const panel = document.getElementById('shotPanel')
    if (!panel) return

    const observer = new MutationObserver(() => {
      if (panel.classList.contains('open')) {
        setTags(DEFAULT_TAGS)
      }
    })
    observer.observe(panel, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // タグが変わるたびに window.__shotTags に同期（confirmShot から参照）
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__shotTags = tags
  }, [tags])

  return (
    <div id="shotPanel">
      <div className="sp-header">
        <div><div id="spShotNo" className="sp-shotno">1打目を登録</div></div>
        <button className="sp-close" onClick={cancelShot}>✕</button>
      </div>
      <div className="sp-tabs">
        <button id="spTabRecord"  className="sp-tab active" onClick={()=>switchSpTab('record')}>🏌️ 記録</button>
        <button id="spTabPenalty" className="sp-tab"        onClick={()=>switchSpTab('penalty')}>⚠️ ペナルティ</button>
        <button id="spTabDist"    className="sp-tab"        onClick={()=>switchSpTab('dist')}>📏 飛距離</button>
      </div>

      {/* 記録タブ */}
      <div id="spBodyRecord">
        <div id="clubGrid" className="club-grid" suppressHydrationWarning></div>
        <ShotTagPicker value={tags} onChange={setTags} />
        <div className="sp-btns">
          <button id="spOkBtn" className="sp-ok" onClick={confirmShot}>登録する</button>
          <button className="sp-cancel" onClick={cancelShot}>キャンセル</button>
        </div>
      </div>

      {/* 飛距離タブ */}
      <div id="spBodyDist" style={{display:'none'}} suppressHydrationWarning>
        <div className="sp-dists">
          <div className="sp-dist-card carry">
            <div className="sdc-label">carry</div>
            <div className="sdc-from">ティーから</div>
            <div className="sdc-val blue">—<span>yd</span></div>
          </div>
          <div className="sp-dist-card remain">
            <div className="sdc-label">remaining</div>
            <div className="sdc-from">センターまで</div>
            <div className="sdc-val yellow">—<span>yd</span></div>
          </div>
        </div>
        <div className="sp-hint-small">地図をタップして位置を調整できます</div>
      </div>

      {/* ペナルティタブ */}
      <div id="spBodyPenalty" style={{display:'none'}}>
        <div id="spPenaltyStatus" className="sp-penalty-status">OBの場合: 次の打数を選択 → 登録</div>
        <div id="spPenaltyTeeSection">
          <div className="sp-penalty-title">OB後の打数を選択</div>
          <div className="sp-penalty-btns">
            <button id="pbBtn3" className="pb" onClick={()=>selectPenalty(3)}>プレ3<small>3打目から</small></button>
            <button id="pbBtn4" className="pb" onClick={()=>selectPenalty(4)}>プレ4<small>4打目から</small></button>
            <button id="pbBtn5" className="pb" onClick={()=>selectPenalty(5)}>プレ5<small>5打目から</small></button>
          </div>
          <div className="sp-ob-type-label">ペナルティ種別（任意）</div>
          <div className="sp-ob-type-btns">
            {OB_TYPES.map(ob=>(
              <button key={ob.type} className="sp-ob-btn" data-type={ob.type} onClick={e=>selectShotObType(e.currentTarget as HTMLElement,ob.type)}>{ob.icon} {ob.type}<small>{ob.desc}</small></button>
            ))}
          </div>
        </div>
        <div id="spPenaltyHazardSection" style={{display:'none'}}>
          <div className="sp-ob-type-label">ペナルティ種別（任意）</div>
          <div className="sp-ob-type-btns">
            {OB_TYPES.map(ob=>(
              <button key={ob.type} className="sp-ob-btn" data-type={ob.type} onClick={e=>selectShotObType(e.currentTarget as HTMLElement,ob.type)}>{ob.icon} {ob.type}<small>{ob.desc}</small></button>
            ))}
          </div>
          <div className="sp-penalty-info">1打罰を自動加算して記録します</div>
          <div className="sp-retee-area">
            <div className="sp-retee-label">OB・紛失球の場合（打ち直し）</div>
            <button className="sp-retee-btn" onClick={useReteePosition}>↩ 前の打点に戻る（打ち直し）</button>
          </div>
        </div>
        <div className="sp-btns" style={{marginTop:'8px'}}>
          <button id="spPenaltyOkBtn" className="sp-ok" onClick={confirmPenaltyDrop}>📍 ここに登録する</button>
          <button className="sp-cancel" onClick={cancelPenalty}>↺ リセット</button>
        </div>
      </div>
    </div>
  )
}

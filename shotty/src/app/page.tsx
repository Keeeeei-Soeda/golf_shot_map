'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import {
  initMap, initApp,
  toggleMenu, closeMenu, onGCSel, onCourseSel, sidebarSelectTee, selectSidebarCourseCombo,
  selectHole, prevHole, nextHole, setMode, openCupPanel, closeCupPanel,
  toggleReview, openReview, closeReview, clearHoleShots, openHoleSummary, closeHoleSummary,
  openHistory, closeHistory, loadRound, clearAllHistory, exportCaddyNotes,
  openClubEditor, closeClubEditor, saveClubEditor, resetClubEditor,
  toggleClubPreset, removeClubSlot, addOtherClub,
  onGpsBtn, recordCurrentGps, rotateToHole, toggleYardageInfo,
  selectClub, selectResult, switchSpTab, selectPenalty, confirmPenaltyDrop, cancelPenalty,
  selectShotObType, useReteePosition, confirmShot, cancelShot,
  selectCupScore, selectCupStrokePenalty, selectCupObType, selectCupPutts, confirmCupIn,
  deleteShot, openScorecard, closeScorecard,
  emSelectPref, emBackToPref, emSelectGc, emBackToGc, emSelectCourse, emBackToCourse, emSelectTee,
  openStrategySelector, closeStrategySelector, setStrategySourceTab,
  activateStrategyLocal, deactivateStrategy,
  resumeActiveRound, updateResumeBanner,
} from './golf/logic'

// ============================================================
// Window 型拡張
// ============================================================
declare global {
  interface Window {
    _currentBearing: number
    _pins: any[]
    initMap: () => void
    // inline onclick handlers 用
    toggleMenu: () => void
    closeMenu: () => void
    onGCSel: () => void
    onCourseSel: () => void
    sidebarSelectTee: (t: string) => void
    selectSidebarCourseCombo: (g: number, c: number, c2: number) => void
    selectHole: (i: number) => void
    prevHole: () => void
    nextHole: () => void
    setMode: (m: string) => void
    openCupPanel: () => void
    closeCupPanel: () => void
    toggleReview: () => void
    openReview: () => void
    closeReview: () => void
    clearHoleShots: () => void
    openHoleSummary: () => void
    closeHoleSummary: () => void
    openHistory: () => void
    closeHistory: () => void
    loadRound: (id: string) => void
    clearAllHistory: () => void
    exportCaddyNotes: () => void
    openClubEditor: () => void
    closeClubEditor: () => void
    saveClubEditor: () => void
    resetClubEditor: () => void
    toggleClubPreset: (c: string) => void
    removeClubSlot: (i: number) => void
    addOtherClub: () => void
    onGpsBtn: () => void
    recordCurrentGps: () => void
    rotateToHole: () => void
    toggleYardageInfo: () => void
    selectClub: (c: string) => void
    selectResult: (r: string) => void
    switchSpTab: (t: string) => void
    selectPenalty: (n: number) => void
    confirmPenaltyDrop: () => void
    cancelPenalty: () => void
    selectShotObType: (btn: HTMLElement, type: string) => void
    useReteePosition: () => void
    confirmShot: () => void
    cancelShot: () => void
    selectCupScore: (diff: number) => void
    selectCupStrokePenalty: (btn: HTMLElement, n: number) => void
    selectCupObType: (btn: HTMLElement, type: string) => void
    selectCupPutts: (btn: HTMLElement, n: number) => void
    confirmCupIn: () => void
    deleteShot: (i: number) => void
    openScorecard: () => void
    closeScorecard: () => void
    emSelectPref: (p: string) => void
    emBackToPref: () => void
    emSelectGc: (i: number) => void
    emBackToGc: () => void
    emSelectCourse: (g: number, c: number, c2?: number) => void
    emBackToCourse: () => void
    emSelectTee: (t: string) => void
    openStrategySelector: () => void
    closeStrategySelector: () => void
    setStrategySourceTab: (src: string) => void
    activateStrategyLocal: (id: string) => void
    deactivateStrategy: () => void
    resumeActiveRound: () => boolean
    updateResumeBanner: () => void
  }
}

// ============================================================
// React コンポーネント
// ============================================================
export default function Page() {
  useEffect(() => {
    // 全関数を window に登録（inline onclick handlers 用）
    Object.assign(window, {
      initMap,
      toggleMenu, closeMenu, onGCSel, onCourseSel, sidebarSelectTee, selectSidebarCourseCombo,
      selectHole, prevHole, nextHole, setMode, openCupPanel, closeCupPanel,
      toggleReview, openReview, closeReview, clearHoleShots, openHoleSummary, closeHoleSummary,
      openHistory, closeHistory, loadRound, clearAllHistory, exportCaddyNotes,
      openClubEditor, closeClubEditor, saveClubEditor, resetClubEditor,
      toggleClubPreset, removeClubSlot, addOtherClub,
      onGpsBtn, recordCurrentGps, rotateToHole, toggleYardageInfo,
      selectClub, selectResult, switchSpTab, selectPenalty, confirmPenaltyDrop, cancelPenalty,
      selectShotObType, useReteePosition, confirmShot, cancelShot,
      selectCupScore, selectCupStrokePenalty, selectCupObType, selectCupPutts, confirmCupIn,
      deleteShot, openScorecard, closeScorecard,
      emSelectPref, emBackToPref, emSelectGc, emBackToGc, emSelectCourse, emBackToCourse, emSelectTee,
      openStrategySelector, closeStrategySelector, setStrategySourceTab,
      activateStrategyLocal, deactivateStrategy,
      resumeActiveRound, updateResumeBanner,
    })
    initApp()
  }, [])

  return (
    <>
      {/* ===== HEADER ===== */}
      <header>
        <button id="hbgBtn" className="hbg-btn" onClick={toggleMenu} title="メニュー">
          <span/><span/><span/>
        </button>
        <div className="logo">SHOTTY <small>caddy</small></div>
        <div className="hdr-right">
          <button id="gpsBtn" className="hdr-btn" onClick={onGpsBtn} title="GPS">📍</button>
          <button className="hdr-btn" onClick={openScorecard} title="スコアカード">📊</button>
          <div id="histBtn" style={{position:'relative'}}>
            <button className="hdr-btn" onClick={openHistory}>📋</button>
            <span id="histBadge" className="hist-badge" style={{display:'none'}}></span>
          </div>
        </div>
      </header>

      {/* ===== ハンバーガーメニュー ===== */}
      <div id="menuOverlay" onClick={closeMenu}></div>
      <div id="menuPanel">
        <div className="menu-header">
          <span className="menu-title">コース設定</span>
          <button className="menu-close" onClick={closeMenu}>✕</button>
        </div>
        <div className="menu-body">
          <div className="menu-label">ゴルフ場</div>
          <div className="menu-sel-wrap">
            <select id="gcSel" onChange={onGCSel} defaultValue="">
              <option value="">-- ゴルフ場を選択 --</option>
            </select>
          </div>
          <div className="menu-label">コース</div>
          <div className="menu-sel-wrap">
            <select id="courseSel" onChange={onCourseSel} defaultValue="">
              <option value="">-- コース --</option>
            </select>
          </div>
          <div id="courseComboWrap" className="menu-course-combo-wrap" style={{display:'none'}}>
            <div id="courseComboBtns" className="menu-combo-btns" suppressHydrationWarning></div>
          </div>
          <div id="sidebarTeeRow" className="menu-sidebar-tee" style={{display:'none'}}>
            <div className="menu-label">ティー種別</div>
            <div className="menu-tee-btns">
              <button className="menu-tee-btn regular" onClick={()=>sidebarSelectTee('regular')}>⛳ レギュラーティー</button>
              <button className="menu-tee-btn ladies" onClick={()=>sidebarSelectTee('ladies')}>🌸 レディースティー</button>
            </div>
          </div>
          <div className="menu-label">ホール選択</div>
          <div id="holeStrip" suppressHydrationWarning></div>
          <div className="menu-divider"></div>
          <button className="menu-club-btn" onClick={openStrategySelector}>📍 マップで過去記録を見る</button>
          <button className="menu-club-btn" style={{marginTop:'6px'}} onClick={openScorecard}>📊 スコアカード</button>
          <a className="menu-club-btn" style={{display:'block',marginTop:'6px',textDecoration:'none'}} href="/ai" target="_blank" rel="noopener noreferrer">🤖 AI相談モード</a>
          <Link className="menu-club-btn" style={{ display: 'block', marginTop: '6px', textDecoration: 'none' }} href="/swing" prefetch={false} target="_blank" rel="noopener noreferrer">🎥 スイング解析</Link>
          <button className="menu-club-btn" style={{marginTop:'6px'}} onClick={openClubEditor}>🏌️ クラブセット編集</button>
          <div className="menu-divider"></div>
        </div>
      </div>

      {/* ===== スコアカードパネル ===== */}
      <div id="scorecardPanel">
        <div className="scp-header">
          <button className="scp-back" onClick={closeScorecard}>← 戻る</button>
          <div className="scp-title">📊 スコアカード</div>
        </div>
        <div id="scpBody" className="scp-body" suppressHydrationWarning>
          <div className="scp-no-course">コースを選択してください</div>
        </div>
      </div>

      {/* ===== クラブエディタパネル ===== */}
      <div id="clubEditorPanel">
        <div className="ce-header">
          <button className="ce-back" onClick={closeClubEditor}>← 戻る</button>
          <span className="ce-title">クラブセット編集</span>
          <button className="ce-save" onClick={saveClubEditor}>保存</button>
        </div>
        <div className="ce-body">
          <div className="ce-count-wrap">
            <div className="ce-count-bar-bg"><div id="ceCountBar" className="ce-count-bar"></div></div>
            <div id="ceCount" className="ce-count">0 / 14本</div>
          </div>
          <div className="ce-slots-label">現在のセット（タップで削除）</div>
          <div id="ceSlots" className="ce-slots" suppressHydrationWarning></div>
          <div style={{marginTop:'12px',marginBottom:'6px',fontSize:'10px',color:'var(--gr)',letterSpacing:'1px'}}>クラブを選択（タップで追加/削除）</div>
          <div id="cePresets" suppressHydrationWarning></div>
          <div className="ce-other-wrap">
            <input id="ceOtherInput" className="ce-other-input" type="text" placeholder="その他" />
            <button className="ce-other-add" onClick={addOtherClub}>追加</button>
          </div>
          <button className="ce-reset" onClick={resetClubEditor}>デフォルトに戻す</button>
        </div>
      </div>

      {/* ===== マップエリア ===== */}
      <div id="mapWrap">
        <div id="legend">
          <div className="leg-r"><div className="leg-dot" style={{background:'#4a9fd4'}}></div>T = ティー</div>
          <div className="leg-r"><div className="leg-dot" style={{background:'#e05252'}}></div>F = フロント</div>
          <div className="leg-r"><div className="leg-dot" style={{background:'#a78bfa'}}></div>C = センター</div>
          <div className="leg-r"><div className="leg-dot" style={{background:'#e8c84a'}}></div>B = バック</div>
        </div>
        <div id="mapBtns" className="map-btns" style={{display:'none'}}>
          <button id="gpsRecBtn" className="gps-rec-btn" onClick={recordCurrentGps} title="現在地を記録">✏️</button>
          <button id="rotateBtn" className="rotate-btn" onClick={rotateToHole} title="ホール方向に回転">⛳↑</button>
          <button id="yiToggleBtn" className="yi-toggle-btn" onClick={toggleYardageInfo} title="ヤード情報">T</button>
        </div>
        <div id="yardageInfo" style={{display:'none'}} suppressHydrationWarning></div>
        <div id="strategyBanner" className="strategy-banner" style={{display:'none'}}></div>
        <div id="recBanner" style={{display:'none'}}></div>
        <div id="resumeBanner" className="resume-banner" style={{display:'none'}}></div>
        <div id="map" style={{display:'none'}}></div>
        <div id="emptyMap">
          <div className="ico">⛳</div>
          <p>コースを選択してください</p>
          <div className="em-selector">
            <div id="emStepPref" className="em-step" style={{display:'flex'}}>
              <div className="em-label">都道府県</div>
              <div id="emPrefBtns" className="em-pref-btns" suppressHydrationWarning></div>
            </div>
            <div id="emStepGc" className="em-step" style={{display:'none'}}>
              <div className="em-label"><span className="em-back" onClick={emBackToPref}>← 戻る</span> ゴルフ場</div>
              <div id="emGcBtns" className="em-gc-btns" suppressHydrationWarning></div>
            </div>
            <div id="emStepCourse" className="em-step" style={{display:'none'}}>
              <div className="em-label"><span className="em-back" onClick={emBackToGc}>← 戻る</span> コース</div>
              <div id="emCourseBtns" className="em-course-btns" suppressHydrationWarning></div>
            </div>
            <div id="emStepTee" className="em-step" style={{display:'none'}}>
              <div className="em-label"><span className="em-back" onClick={emBackToCourse}>← 戻る</span> ティー種別</div>
              <div className="em-tee-btns">
                <button className="em-tee-btn regular" onClick={()=>emSelectTee('regular')}>⛳ レギュラーティー</button>
                <button className="em-tee-btn ladies" onClick={()=>emSelectTee('ladies')}>🌸 レディースティー</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ボトムバー ===== */}
      <div id="bottomBar">
        <div className="mode-tabs">
          <button id="tabMeasure" className="mtab active" onClick={()=>setMode('measure')}>📏 測定</button>
          <button id="tabRecord" className="mtab rec" onClick={()=>setMode('record')}>🏌️ 記録</button>
        </div>
        <div id="modeInfo" className="mode-info">コースを選択</div>
        <div id="holeNavBtns" className="hole-nav" style={{display:'none'}}>
          <button id="prevHoleBtn" className="hole-nav-btn" onClick={prevHole}>◀ 前H</button>
          <button id="nextHoleBtn" className="hole-nav-btn" onClick={nextHole}>次H ▶</button>
        </div>
        <button id="cupBtn" onClick={openCupPanel} style={{display:'none'}}>⛳ IN</button>
        <button className="bb-btn" id="reviewBtn" onClick={toggleReview} style={{display:'none'}}>📋</button>
        <button className="bb-btn danger" onClick={clearHoleShots} style={{display:'none'}} id="clearBtn">↺</button>
      </div>

      {/* ===== ショットパネル ===== */}
      <div id="shotPanel">
        <div className="sp-header">
          <div><div id="spShotNo" className="sp-shotno">1打目を登録</div></div>
          <button className="sp-close" onClick={cancelShot}>✕</button>
        </div>
        <div className="sp-tabs">
          <button id="spTabRecord" className="sp-tab active" onClick={()=>switchSpTab('record')}>🏌️ 記録</button>
          <button id="spTabPenalty" className="sp-tab" onClick={()=>switchSpTab('penalty')}>⚠️ ペナルティ</button>
          <button id="spTabDist" className="sp-tab" onClick={()=>switchSpTab('dist')}>📏 飛距離</button>
        </div>
        <div id="spBodyRecord">
          <div id="clubGrid" className="club-grid" suppressHydrationWarning></div>
          <div className="sp-result-section">
            <div className="sp-result-label">評価（任意）</div>
            <div className="sp-result-btns">
              {[{key:'ナイスショット',label:'👍 ナイス',cls:'nice'},{key:'ミスショット',label:'😤 ミス',cls:'miss'},{key:'ダフり',label:'⛏ ダフり',cls:'duff'},{key:'スライス',label:'↗ スライス',cls:'slice'},{key:'フック',label:'↙ フック',cls:'hook'}].map(r=>(
                <button key={r.key} className={`rb ${r.cls}`} data-key={r.key} onClick={()=>selectResult(r.key)}>{r.label}</button>
              ))}
            </div>
          </div>
          <div className="sp-btns">
            <button id="spOkBtn" className="sp-ok" onClick={confirmShot}>登録する</button>
            <button className="sp-cancel" onClick={cancelShot}>キャンセル</button>
          </div>
        </div>
        <div id="spBodyDist" style={{display:'none'}} suppressHydrationWarning>
          <div className="sp-dists">
            <div className="sp-dist-card carry"><div className="sdc-label">carry</div><div className="sdc-from">ティーから</div><div className="sdc-val blue">—<span>yd</span></div></div>
            <div className="sp-dist-card remain"><div className="sdc-label">remaining</div><div className="sdc-from">センターまで</div><div className="sdc-val yellow">—<span>yd</span></div></div>
          </div>
          <div className="sp-hint-small">地図をタップして位置を調整できます</div>
        </div>
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
              {[{type:'ペナルティエリア',icon:'🏊',desc:'池・川など'},{type:'アンプレヤブル',icon:'🌳',desc:'打てない場所'},{type:'紛失球',icon:'🔍',desc:'ロストボール'},{type:'OB',icon:'🚫',desc:'白杭・黄杭外'}].map(ob=>(
                <button key={ob.type} className="sp-ob-btn" data-type={ob.type} onClick={e=>selectShotObType(e.currentTarget as HTMLElement,ob.type)}>{ob.icon} {ob.type}<small>{ob.desc}</small></button>
              ))}
            </div>
          </div>
          <div id="spPenaltyHazardSection" style={{display:'none'}}>
            <div className="sp-ob-type-label">ペナルティ種別（任意）</div>
            <div className="sp-ob-type-btns">
              {[{type:'ペナルティエリア',icon:'🏊',desc:'池・川など'},{type:'アンプレヤブル',icon:'🌳',desc:'打てない場所'},{type:'紛失球',icon:'🔍',desc:'ロストボール'},{type:'OB',icon:'🚫',desc:'白杭・黄杭外'}].map(ob=>(
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

      {/* ===== カップインパネル ===== */}
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

      {/* ===== レビューパネル ===== */}
      <div id="reviewOverlay" onClick={closeReview}></div>
      <div id="reviewPanel">
        <div id="rvTitle" className="rv-title" suppressHydrationWarning>ショット履歴</div>
        <div style={{marginBottom:'8px'}}>
          <button className="sp-cancel" style={{fontSize:'11px'}} onClick={clearHoleShots}>このホールのショットをすべて削除</button>
        </div>
        <div id="rvList" suppressHydrationWarning></div>
      </div>

      {/* ===== ホールサマリー ===== */}
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

      {/* ===== 過去記録オーバーレイ パネル ===== */}
      <div id="strategyPanel" className="strategy-panel">
        <div className="scp-header">
          <button className="scp-back" onClick={closeStrategySelector}>← 戻る</button>
          <div className="scp-title">📍 マップで過去記録を見る</div>
        </div>
        <div id="stDeactivateWrap" style={{display:'none',padding:'8px 12px'}}>
          <button className="sp-cancel" style={{width:'100%'}} onClick={deactivateStrategy}>🗑 オーバーレイを消去</button>
        </div>
        <div className="st-tabs">
          <button id="stTabLocal" className="st-tab active" onClick={()=>setStrategySourceTab('local')}>📱 ローカル履歴</button>
          <button id="stTabJson" className="st-tab" onClick={()=>setStrategySourceTab('json')}>☁ JSON</button>
        </div>
        <div id="stRoundList" className="st-round-list" suppressHydrationWarning></div>
      </div>

      {/* ===== 履歴パネル ===== */}
      <div id="histPanel">
        <div className="hist-hdr">
          <h2>📋 ラウンド履歴</h2>
          <button className="hist-close" onClick={closeHistory}>✕</button>
        </div>
        <div className="hist-list">
          <div style={{padding:'4px 0 8px'}}>
            <button className="sp-cancel" style={{width:'100%'}} onClick={exportCaddyNotes}>📤 caddy_notes.json をエクスポート</button>
          </div>
          <div id="histList" suppressHydrationWarning></div>
        </div>
      </div>

      <Script
        id="google-maps"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap&loading=async&libraries=marker&language=ja`}
        strategy="afterInteractive"
      />
    </>
  )
}

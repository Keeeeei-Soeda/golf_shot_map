'use client'

import {
  emBackToPref, emBackToGc, emBackToCourse, emSelectTee,
  prevHole, nextHole, setMode, openCupPanel, toggleReview, clearHoleShots,
} from '@/app/golf/logic'
import YardageBar from './YardageBar'

export default function GolfMap() {
  return (
    <>
      {/* ===== マップエリア ===== */}
      <div id="mapWrap">
        <div id="legend">
          <div className="leg-r"><div className="leg-dot" style={{background:'#4a9fd4'}}></div>T = ティー</div>
          <div className="leg-r"><div className="leg-dot" style={{background:'#e05252'}}></div>F = フロント</div>
          <div className="leg-r"><div className="leg-dot" style={{background:'#a78bfa'}}></div>C = センター</div>
          <div className="leg-r"><div className="leg-dot" style={{background:'#e8c84a'}}></div>B = バック</div>
        </div>
        <YardageBar />
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
    </>
  )
}

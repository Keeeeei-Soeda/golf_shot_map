'use client'

import {
  emBackToPref, emBackToGc, emBackToCourse, emSelectTee,
  openCupPanel, toggleReview, clearHoleShots,
} from '@/app/golf/logic'
import DistanceCard from './DistanceCard'
import HoleBar from './HoleBar'
import SideActions from './SideActions'
import YardageBar from './YardageBar'

export default function GolfMap() {
  return (
    <>
      {/* ===== マップエリア ===== */}
      <div id="mapWrap">
        {/* T/F/C/B の凡例はマップを覆わないようサイドパネルへ移設済み */}
        <DistanceCard />
        <SideActions />
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

      {/* ===== ボトムバー（ホール送り＋番号のみ） ===== */}
      <HoleBar />

      {/*
        旧ボトムバーの操作。ステップ4・5で各パネル内へ移設するまでの一時退避。
        logic.ts が id を参照するため DOM から取り除かない。
      */}
      <div id="legacyControls" style={{display:'none'}}>
        <button id="cupBtn" onClick={openCupPanel}>⛳ IN</button>
        <button className="bb-btn" id="reviewBtn" onClick={toggleReview}>📋</button>
        <button className="bb-btn danger" id="clearBtn" onClick={clearHoleShots}>↺</button>
      </div>
    </>
  )
}

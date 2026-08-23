'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  closeMenu, onGCSel, sidebarSelectTee, selectSidebarCourseCombo,
  openStrategySelector, openScorecard, openClubEditor,
  closeScorecard, closeStrategySelector, setStrategySourceTab,
  deactivateStrategy,
} from '@/app/golf/logic'
import { st } from '@/app/golf/state'
import { COURSES } from '@/data/courses'
import HoleStrip from './HoleStrip'
import CourseSelector from './CourseSelector'
import EndRoundButton from './EndRoundButton'
import type { GolfCourse } from '@/types'

type Props = {
  roundInProgress: boolean
  completedHoles: number
  onEndRound: () => void
}

export default function Sidebar({ roundInProgress, completedHoles, onEndRound }: Props) {
  const [selectedGCIdx, setSelectedGCIdx] = useState<number | null>(null)

  const handleGcChange = () => {
    onGCSel()
    setSelectedGCIdx(st.gcIdx)
  }

  const selectedGC: GolfCourse | null =
    selectedGCIdx !== null ? (COURSES[selectedGCIdx] as GolfCourse) : null

  // 進行中ラウンドのコースラベルを st から取得
  const getCourseLabel = () => {
    if (st.gcIdx === null || st.cIdx === null) return ''
    const gc = COURSES[st.gcIdx]
    const firstName = gc?.courses[st.cIdx]?.name ?? ''
    if (st.cIdx2 !== null) {
      const secondName = gc?.courses[st.cIdx2]?.name ?? ''
      return `${firstName} → ${secondName}`
    }
    return firstName
  }

  const getGCName = () => {
    if (st.gcIdx === null) return '未選択'
    return COURSES[st.gcIdx]?.name ?? '未選択'
  }

  const getTeeLabel = () => {
    if (st.teeType === 'ladies') return '🌸 レディースティー'
    return '⛳ レギュラーティー'
  }

  return (
    <>
      {/* ===== ハンバーガーメニュー ===== */}
      <div id="menuOverlay" onClick={closeMenu}></div>
      <div id="menuPanel">
        <div className="menu-header">
          <span className="menu-title">コース設定</span>
          <button className="menu-close" onClick={closeMenu}>✕</button>
        </div>
        <div className="menu-body">
          {/* ===== ゴルフ場選択（常に表示） ===== */}
          <div className="menu-label">ゴルフ場</div>
          <div className="menu-sel-wrap">
            <select id="gcSel" onChange={handleGcChange} defaultValue="">
              <option value="">-- ゴルフ場を選択 --</option>
            </select>
          </div>

          {/* ===== Vanilla JS 内部用（React から隠す） ===== */}
          <div style={{ display: 'none' }}>
            <select id="courseSel" defaultValue="">
              <option value="">-- コース --</option>
            </select>
            <div id="courseComboWrap" className="menu-course-combo-wrap">
              <div id="courseComboBtns" className="menu-combo-btns" suppressHydrationWarning></div>
            </div>
          </div>

          {/* ===== ティー選択（Vanilla JS で表示切替） ===== */}
          <div id="sidebarTeeRow" className="menu-sidebar-tee" style={{ display: 'none' }}>
            <div className="menu-label">ティー種別</div>
            <div className="menu-tee-btns">
              <button className="menu-tee-btn regular" onClick={() => sidebarSelectTee('regular')}>⛳ レギュラーティー</button>
              <button className="menu-tee-btn ladies" onClick={() => sidebarSelectTee('ladies')}>🌸 レディースティー</button>
            </div>
          </div>

          {/* ===== コース選択 or 進行中ロック ===== */}
          {roundInProgress ? (
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(17,24,39,0.6)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
                進行中：{completedHoles}/18 ホール
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6' }}>
                {getGCName()}
              </div>
              <div style={{ fontSize: 13, color: '#d1d5db', marginTop: 2 }}>
                {getCourseLabel()}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {getTeeLabel()}
              </div>
            </div>
          ) : (
            selectedGC && (
              <CourseSelector
                gc={selectedGC}
                onSelect={(cIdx, cIdx2) => selectSidebarCourseCombo(selectedGCIdx!, cIdx, cIdx2)}
              />
            )
          )}

          {/* ===== ホールストリップ ===== */}
          <div className="menu-label" style={{ marginTop: 12 }}>ホール選択</div>
          <HoleStrip />

          <div className="menu-divider"></div>

          {/* ===== 基準ピンの凡例 ===== */}
          <div className="menu-label">マップの基準ピン</div>
          <div className="menu-legend">
            <div className="leg-r"><div className="leg-dot" style={{ background: '#4a9fd4' }}></div>T = ティー</div>
            <div className="leg-r"><div className="leg-dot" style={{ background: '#e05252' }}></div>F = フロント</div>
            <div className="leg-r"><div className="leg-dot" style={{ background: '#a78bfa' }}></div>⛳ = センター</div>
            <div className="leg-r"><div className="leg-dot" style={{ background: '#e8c84a' }}></div>B = バック</div>
          </div>

          <div className="menu-divider"></div>
          <button className="menu-club-btn" onClick={openStrategySelector}>📍 マップで過去記録を見る</button>
          <button className="menu-club-btn" style={{ marginTop: '6px' }} onClick={openScorecard}>📊 スコアカード</button>
          <Link className="menu-club-btn" style={{ display: 'block', marginTop: '6px', textDecoration: 'none' }} href="/mypage" onClick={closeMenu}>📖 ラウンド振り返り</Link>
          <a className="menu-club-btn" style={{ display: 'block', marginTop: '6px', textDecoration: 'none' }} href="/ai" target="_blank" rel="noopener noreferrer">🤖 AI相談モード</a>
          <Link className="menu-club-btn" style={{ display: 'block', marginTop: '6px', textDecoration: 'none' }} href="/swing" prefetch={false} target="_blank" rel="noopener noreferrer">🎥 スイング解析</Link>
          <button className="menu-club-btn" style={{ marginTop: '6px' }} onClick={openClubEditor}>🏌️ クラブセット編集</button>
          <div className="menu-divider"></div>

          {/* ===== 途中終了ボタン（進行中のみ） ===== */}
          {roundInProgress && (
            <EndRoundButton
              completedHoles={completedHoles}
              onConfirm={onEndRound}
            />
          )}
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

      {/* ===== 過去記録オーバーレイ パネル ===== */}
      <div id="strategyPanel" className="strategy-panel">
        <div className="scp-header">
          <button className="scp-back" onClick={closeStrategySelector}>← 戻る</button>
          <div className="scp-title">📍 マップで過去記録を見る</div>
        </div>
        <div id="stDeactivateWrap" style={{ display: 'none', padding: '8px 12px' }}>
          <button className="sp-cancel" style={{ width: '100%' }} onClick={deactivateStrategy}>🗑 オーバーレイを消去</button>
        </div>
        <div className="st-tabs">
          <button id="stTabLocal" className="st-tab active" onClick={() => setStrategySourceTab('local')}>📱 ローカル履歴</button>
          <button id="stTabJson" className="st-tab" onClick={() => setStrategySourceTab('json')}>☁ JSON</button>
        </div>
        <div id="stRoundList" className="st-round-list" suppressHydrationWarning></div>
      </div>
    </>
  )
}

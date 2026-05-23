'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useRef } from 'react'
import Script from 'next/script'
import SignupModal18h from '@/components/prompts/SignupModal18h'
import ContinueRoundModal from '@/components/ContinueRoundModal'
import { countCompletedHoles } from '@/lib/signup-prompt'
import { gs } from './golf/state'
import { COURSES } from '@/data/courses'
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
  resumeActiveRound, updateResumeBanner, saveRound,
} from './golf/logic'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/sidebar/Sidebar'
import ClubEditor from '@/components/sidebar/ClubEditor'
import GolfMap from '@/components/map/GolfMap'
import ShotPanel from '@/components/map/ShotPanel'
import CupPanel from '@/components/map/CupPanel'
import ReviewPanel from '@/components/map/ReviewPanel'
import HoleSummary from '@/components/map/HoleSummary'
import HistoryPanel from '@/components/history/HistoryPanel'

// Window 型拡張（動的生成 HTML の inline onclick 用）
declare global {
  interface Window {
    _currentBearing: number; _pins: any[]
    initMap: () => void
    toggleMenu: () => void; closeMenu: () => void; onGCSel: () => void; onCourseSel: () => void
    sidebarSelectTee: (t: string) => void; selectSidebarCourseCombo: (g: number, c: number, c2: number) => void
    selectHole: (i: number) => void; prevHole: () => void; nextHole: () => void; setMode: (m: string) => void
    openCupPanel: () => void; closeCupPanel: () => void
    toggleReview: () => void; openReview: () => void; closeReview: () => void
    clearHoleShots: () => void; openHoleSummary: () => void; closeHoleSummary: () => void
    openHistory: () => void; closeHistory: () => void; loadRound: (id: string) => void
    clearAllHistory: () => void; exportCaddyNotes: () => void
    openClubEditor: () => void; closeClubEditor: () => void; saveClubEditor: () => void; resetClubEditor: () => void
    toggleClubPreset: (c: string) => void; removeClubSlot: (i: number) => void; addOtherClub: () => void
    onGpsBtn: () => void; recordCurrentGps: () => void; rotateToHole: () => void; toggleYardageInfo: () => void
    selectClub: (c: string) => void; selectResult: (r: string) => void; switchSpTab: (t: string) => void
    selectPenalty: (n: number) => void; confirmPenaltyDrop: () => void; cancelPenalty: () => void
    selectShotObType: (btn: HTMLElement, type: string) => void; useReteePosition: () => void
    confirmShot: () => void; cancelShot: () => void
    selectCupScore: (diff: number) => void; selectCupStrokePenalty: (btn: HTMLElement, n: number) => void
    selectCupObType: (btn: HTMLElement, type: string) => void; selectCupPutts: (btn: HTMLElement, n: number) => void
    confirmCupIn: () => void; deleteShot: (i: number) => void
    openScorecard: () => void; closeScorecard: () => void
    emSelectPref: (p: string) => void; emBackToPref: () => void; emSelectGc: (i: number) => void
    emBackToGc: () => void; emSelectCourse: (g: number, c: number, c2?: number) => void
    emBackToCourse: () => void; emSelectTee: (t: string) => void
    openStrategySelector: () => void; closeStrategySelector: () => void; setStrategySourceTab: (src: string) => void
    activateStrategyLocal: (id: string) => void; deactivateStrategy: () => void
    resumeActiveRound: () => boolean; updateResumeBanner: () => void
  }
}

// ============================================================
// React コンポーネント
// ============================================================
export default function Page() {
  // =====================================================
  // RF-7: 全状態を1ポーリングで一括取得（3秒）
  // =====================================================
  const [polledState, setPolledState] = useState({
    completedHoles: 0,
    totalScore: 0,
    gcName: '',
    inProgress: false,
  })
  const prevCompletedRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const shots = gs.roundShots ?? {}
      const completed = countCompletedHoles({ shots })

      // 合計スコア計算（ポーリング内で実行）
      let total = 0
      for (const [key, value] of Object.entries(shots)) {
        if (key.endsWith('_meta')) {
          const meta = value as any
          if (meta?.cupIn) total += meta.totalShots ?? 0
        }
      }

      const gcIdx = (gs as any).gcIdx ?? null
      const gcName = gcIdx !== null ? (COURSES[gcIdx]?.name ?? '') : ''

      if (completed !== prevCompletedRef.current) {
        prevCompletedRef.current = completed
        setPolledState({
          completedHoles: completed,
          totalScore: total,
          gcName,
          inProgress: completed > 0 && completed < 18,
        })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // =====================================================
  // RF-3 + RF-6: ラウンド終了モーダル（18h完了 / 途中終了）
  // =====================================================
  const [endRoundModalOpen, setEndRoundModalOpen] = useState(false)
  const [endReason, setEndReason] = useState<'complete' | 'midway'>('complete')

  // 18ホール完了の自動検出
  useEffect(() => {
    if (polledState.completedHoles >= 18 && !endRoundModalOpen) {
      setEndReason('complete')
      setEndRoundModalOpen(true)
    }
  }, [polledState.completedHoles, endRoundModalOpen])

  // 途中終了の手動トリガー（EndRoundButton から呼ばれる）
  const handleEndMidway = () => {
    saveRound()
    setEndReason('midway')
    setEndRoundModalOpen(true)
  }

  useEffect(() => {
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
      <Header />
      <Sidebar
        roundInProgress={polledState.inProgress}
        completedHoles={polledState.completedHoles}
        onEndRound={handleEndMidway}
      />
      <ClubEditor />
      <GolfMap />
      <ShotPanel />
      <CupPanel />
      <ReviewPanel />
      <HoleSummary />
      <HistoryPanel />

      {/* RF-4: 進行中ラウンド継続確認モーダル（起動時） */}
      <ContinueRoundModal
        onContinue={() => {}}
        onNew={() => {}}
      />

      {/* RF-3 + RF-6: ラウンド終了モーダル（18h完了 / 途中終了） */}
      <SignupModal18h
        visible={endRoundModalOpen}
        reason={endReason}
        completedHoles={polledState.completedHoles}
        totalScore={polledState.totalScore}
        gcName={polledState.gcName}
        onClose={() => setEndRoundModalOpen(false)}
      />

      <Script
        id="google-maps"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap&loading=async&libraries=marker&language=ja`}
        strategy="afterInteractive"
      />
    </>
  )
}

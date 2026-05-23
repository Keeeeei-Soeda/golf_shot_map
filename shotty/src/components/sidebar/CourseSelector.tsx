'use client'

import { useState, useEffect } from 'react'
import { getCourseCount, getTwoChoicePairs, getAvailableSecondCourses } from '@/lib/course-selection'
import type { GolfCourse } from '@/types'

type Props = {
  gc: GolfCourse | null
  onSelect: (cIdx: number, cIdx2: number) => void
}

export default function CourseSelector({ gc, onSelect }: Props) {
  const [firstCIdx, setFirstCIdx] = useState<number | null>(null)
  const [secondCIdx, setSecondCIdx] = useState<number | null>(null)

  useEffect(() => {
    setFirstCIdx(null)
    setSecondCIdx(null)
  }, [gc?.gcid])

  if (!gc) return null

  const courseCount = getCourseCount(gc)

  // 2コース構成：2択ボタンUI
  if (courseCount === 2) {
    const pairs = getTwoChoicePairs(gc)
    return (
      <div style={{ marginTop: 8 }}>
        <div className="menu-label">ラウンド構成</div>
        {pairs.map((p) => (
          <button
            key={`${p.first}_${p.second}`}
            onClick={() => onSelect(p.first, p.second)}
            className="menu-club-btn"
            style={{ display: 'block', width: '100%', marginTop: 6, textAlign: 'left' }}
          >
            ⛳ {p.label}
          </button>
        ))}
      </div>
    )
  }

  // 3コース以上：動的セレクタUI
  if (courseCount >= 3) {
    const isValid = firstCIdx !== null && secondCIdx !== null && firstCIdx !== secondCIdx

    return (
      <div style={{ marginTop: 8 }}>
        <div className="menu-label">ラウンド構成</div>

        <div style={{ marginTop: 6 }}>
          <div className="menu-label" style={{ fontSize: 11, color: '#9ca3af' }}>最初の9ホール</div>
          <div className="menu-sel-wrap">
            <select
              value={firstCIdx ?? ''}
              onChange={(e) => setFirstCIdx(e.target.value === '' ? null : parseInt(e.target.value, 10))}
            >
              <option value="">選択してください</option>
              {gc.courses.map((c, idx) => (
                <option key={idx} value={idx}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 6 }}>
          <div className="menu-label" style={{ fontSize: 11, color: '#9ca3af' }}>次の9ホール</div>
          <div className="menu-sel-wrap">
            <select
              value={secondCIdx ?? ''}
              onChange={(e) => setSecondCIdx(e.target.value === '' ? null : parseInt(e.target.value, 10))}
              disabled={firstCIdx === null}
              style={{ opacity: firstCIdx === null ? 0.4 : 1 }}
            >
              <option value="">選択してください</option>
              {firstCIdx !== null &&
                getAvailableSecondCourses(gc, firstCIdx).map((c) => (
                  <option key={c.cIdx} value={c.cIdx}>{c.name}</option>
                ))}
            </select>
          </div>
        </div>

        {firstCIdx !== null && secondCIdx !== null && firstCIdx === secondCIdx && (
          <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>同じコースは選べません</div>
        )}

        <button
          onClick={() => {
            if (isValid && firstCIdx !== null && secondCIdx !== null) {
              onSelect(firstCIdx, secondCIdx)
            }
          }}
          disabled={!isValid}
          className="menu-club-btn"
          style={{
            display: 'block', width: '100%', marginTop: 8,
            background: isValid ? '#f97316' : undefined,
            opacity: isValid ? 1 : 0.4,
            color: isValid ? 'white' : undefined,
          }}
        >
          ▶ ラウンド開始
        </button>
      </div>
    )
  }

  return (
    <div style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>
      このゴルフ場は18ホール構成として登録されていません
    </div>
  )
}

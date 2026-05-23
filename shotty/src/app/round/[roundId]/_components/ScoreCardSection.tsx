'use client'

import { useState } from 'react'
import { ShotCell } from './ShotCell'
import { ScoreCell } from './ScoreCell'
import { ShotTagEditor } from './ShotTagEditor'
import type { ShotType, ShotFeel } from '@/constants/shotTags'
import type { ShotTagState } from '@/components/map/ShotTagPicker'

export type ShotData = {
  id: string
  shotNo: number
  club: string | null
  carry: number | null
  isOB: boolean
  shotType: string | null
  shotFeel: string | null
}

export type HoleData = {
  id: string
  holeNo: number   // 1始まり
  par: number
  score: number    // totalShots
  putts: number | null
  shots: ShotData[]
}

type EditingShot = {
  shotId: string
  shotNo: number
  club: string | null
  initial: ShotTagState
}

interface ScoreCardSectionProps {
  side: 'IN' | 'OUT'
  holes: HoleData[]
}

export function ScoreCardSection({ side, holes }: ScoreCardSectionProps) {
  const [showMore, setShowMore] = useState(false)
  const [editing, setEditing] = useState<EditingShot | null>(null)

  const maxShots = Math.max(5, ...holes.map(h => h.shots.length))
  const totalScore = holes.reduce((sum, h) => sum + h.score, 0)
  const totalPar   = holes.reduce((sum, h) => sum + h.par, 0)
  const totalPutts = holes.reduce((sum, h) => sum + (h.putts ?? 0), 0)
  const hasPuttsData = holes.some(h => h.putts != null)
  const diff = totalScore - totalPar

  const baseRows = [1, 2, 3, 4, 5]
  const extraRows = Array.from(
    { length: Math.max(0, maxShots - 5) },
    (_, i) => i + 6
  )
  const hasExtra = extraRows.length > 0
  const showExtra = showMore && hasExtra

  return (
    <div className="bg-white border border-zinc-200/50 rounded-xl p-3.5">
      <div className="flex justify-between items-baseline mb-2">
        <div className="text-[11px] text-zinc-500 uppercase tracking-wider">
          {side}（{side === 'IN' ? '10〜18H' : '1〜9H'}）
        </div>
        <div className="text-xs text-zinc-700 tabular-nums">
          {hasPuttsData && (
            <>
              パット <strong className="text-zinc-900 font-medium text-sm">{totalPutts}</strong>
              {' ・ '}
            </>
          )}
          <strong className="text-zinc-900 font-medium text-sm">{totalScore}</strong>
          <span className="text-[#993C1D] text-[11px] ml-1">
            {diff > 0 ? `+${diff}` : diff === 0 ? 'E' : diff}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-3.5 px-3.5">
        <table className="border-separate border-spacing-0 tabular-nums" style={{ width: 'max-content' }}>
          <thead>
            <tr>
              <Th sticky>ホール</Th>
              {holes.map(h => <Th key={h.holeNo}>{h.holeNo}</Th>)}
              <Th total>合計</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <LabelCell muted>Par</LabelCell>
              {holes.map(h => <Cell key={h.holeNo} muted>{h.par}</Cell>)}
              <Cell total muted>{totalPar}</Cell>
            </tr>

            <tr>
              <LabelCell shaded>スコア</LabelCell>
              {holes.map(h => (
                <td
                  key={h.holeNo}
                  className="border-b border-r border-zinc-200/50 h-9 min-w-[50px] w-[50px] bg-zinc-100 p-0"
                >
                  <ScoreCell score={h.score} par={h.par} />
                </td>
              ))}
              <Cell total>
                <span className="inline-flex items-baseline gap-0.5">
                  <span className="text-sm font-medium">{totalScore}</span>
                  <span className="text-[9px] border border-current rounded-full px-1 opacity-70">
                    {diff > 0 ? `+${diff}` : diff === 0 ? 'E' : diff}
                  </span>
                </span>
              </Cell>
            </tr>

            {baseRows.map(n => (
              <ShotRow key={n} no={n} holes={holes} onEdit={setEditing} />
            ))}

            {hasExtra && (
              <tr>
                <td className="sticky left-0 bg-white border-b border-r border-zinc-200/50 px-2 z-10">
                  <button
                    type="button"
                    onClick={() => setShowMore(s => !s)}
                    className="text-[10px] text-zinc-500 flex items-center gap-1 w-full py-1"
                  >
                    6打目以降
                    <span
                      className={`text-[8px] transition-transform ${showMore ? 'rotate-180' : ''}`}
                    >
                      ▾
                    </span>
                  </button>
                </td>
                <td
                  colSpan={holes.length + 1}
                  className="text-left text-[10px] text-zinc-400 pl-1.5"
                >
                  {showMore
                    ? '展開中（タップで折りたたみ）'
                    : `${extraRows.length}行隠れています`}
                </td>
              </tr>
            )}

            {showExtra && extraRows.map(n => (
              <ShotRow key={n} no={n} holes={holes} onEdit={setEditing} />
            ))}

            <tr>
              <LabelCell muted>パット</LabelCell>
              {holes.map(h => (
                <Cell key={h.holeNo} muted>
                  {h.putts != null ? h.putts : '—'}
                </Cell>
              ))}
              <Cell total muted>{hasPuttsData ? totalPutts : '—'}</Cell>
            </tr>
          </tbody>
        </table>
      </div>
      {editing && (
        <ShotTagEditor
          shotId={editing.shotId}
          shotNo={editing.shotNo}
          club={editing.club}
          initial={editing.initial}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// ─────────── 内部ヘルパー ───────────

function ShotRow({
  no,
  holes,
  onEdit,
}: {
  no: number
  holes: HoleData[]
  onEdit: (s: EditingShot) => void
}) {
  return (
    <tr>
      <LabelCell>{no}打目</LabelCell>
      {holes.map(h => {
        const shot = h.shots.find(s => s.shotNo === no)
        return (
          <td
            key={h.holeNo}
            className="border-b border-r border-zinc-200/50 h-12 min-w-[50px] w-[50px] p-0"
          >
            {shot ? (
              <button
                type="button"
                className="w-full h-full active:bg-zinc-50"
                onClick={() =>
                  onEdit({
                    shotId: shot.id,
                    shotNo: shot.shotNo,
                    club: shot.club,
                    initial: {
                      isOB: shot.isOB,
                      shotType: (shot.shotType ?? null) as ShotType | null,
                      shotFeel: (shot.shotFeel ?? null) as ShotFeel | null,
                    },
                  })
                }
              >
                <ShotCell
                  club={shot.club}
                  carry={shot.carry}
                  isOB={shot.isOB}
                  shotType={(shot.shotType ?? null) as ShotType | null}
                  shotFeel={(shot.shotFeel ?? null) as ShotFeel | null}
                />
              </button>
            ) : (
              <ShotCell />
            )}
          </td>
        )
      })}
      <td className="border-b border-r border-zinc-200/50 h-12 min-w-[50px] w-[50px] bg-zinc-50" />
    </tr>
  )
}

function Th({
  children,
  sticky,
  total,
}: {
  children: React.ReactNode
  sticky?: boolean
  total?: boolean
}) {
  const cls = [
    'h-8 border-b border-r border-zinc-200/50 text-xs font-medium text-zinc-900 bg-zinc-100',
    'min-w-[50px] w-[50px]',
    sticky && 'sticky left-0 z-10 min-w-[64px] w-[64px] text-left px-2',
    total && 'bg-zinc-100 font-medium',
  ]
    .filter(Boolean)
    .join(' ')
  return <th className={cls}>{children}</th>
}

function LabelCell({
  children,
  muted,
  shaded,
}: {
  children: React.ReactNode
  muted?: boolean
  shaded?: boolean
}) {
  const bg = shaded ? 'bg-zinc-100' : muted ? 'bg-zinc-50' : 'bg-white'
  return (
    <td
      className={`sticky left-0 z-10 border-b border-r border-zinc-200/50 text-left px-2 text-[11px] font-medium text-zinc-600 min-w-[64px] w-[64px] ${bg}`}
    >
      {children}
    </td>
  )
}

function Cell({
  children,
  muted,
  total,
}: {
  children?: React.ReactNode
  muted?: boolean
  total?: boolean
}) {
  const cls = [
    'border-b border-r border-zinc-200/50 min-w-[50px] w-[50px] text-center',
    muted ? 'h-7 text-xs bg-zinc-50' : 'h-12',
    total && 'bg-zinc-100 font-medium',
  ]
    .filter(Boolean)
    .join(' ')
  return <td className={cls}>{children}</td>
}

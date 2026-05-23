import type { Round } from '@prisma/client'

interface Props {
  round: Round & {
    totalScore: number
    totalPar: number
    completedHoles: number
  }
}

export function RoundSummaryCard({ round }: Props) {
  const diff = round.totalScore - round.totalPar
  const diffLabel = diff === 0 ? 'Even' : diff > 0 ? `+${diff}` : `${diff}`
  const diffColor = diff < 0 ? 'text-[#1E4E0B]' : diff > 0 ? 'text-[#993C1D]' : 'text-zinc-600'

  return (
    <div className="bg-white border border-zinc-200/50 rounded-xl p-3.5">
      <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">
        ラウンド概要
      </div>
      <div className="text-base font-semibold text-zinc-900 mb-0.5">
        {round.gcName}
      </div>
      <div className="text-xs text-zinc-500 mb-3">
        {round.courseName}
        <span className="mx-1.5 text-zinc-300">·</span>
        {round.date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
      <div className="flex items-baseline gap-3">
        {round.completedHoles > 0 && (
          <>
            <div>
              <span className="text-2xl font-bold tabular-nums">{round.totalScore}</span>
              <span className="text-xs text-zinc-500 ml-1">打</span>
            </div>
            <span className={`text-lg font-medium tabular-nums ${diffColor}`}>
              {diffLabel}
            </span>
            <span className="text-xs text-zinc-400 tabular-nums">
              {round.completedHoles}H完了
            </span>
          </>
        )}
        {round.completedHoles === 0 && (
          <span className="text-xs text-zinc-400">スコア記録なし</span>
        )}
      </div>
    </div>
  )
}

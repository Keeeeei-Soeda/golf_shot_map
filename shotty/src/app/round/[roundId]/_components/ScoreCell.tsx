interface ScoreCellProps {
  score: number
  par: number
}

function getScoreBgClass(diff: number): string {
  if (diff <= -1) return 'bg-[#C0DD97] text-[#173404]'
  if (diff === 1)  return 'bg-[#FAC775] text-[#412402]'
  if (diff >= 2)   return 'bg-[#F4C0D1] text-[#4B1528]'
  return ''
}

export function ScoreCell({ score, par }: ScoreCellProps) {
  const diff = score - par
  const diffLabel = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`

  return (
    <div className={`flex items-center justify-center h-full ${getScoreBgClass(diff)}`}>
      <span className="inline-flex items-baseline gap-0.5">
        <span className="text-sm font-medium tabular-nums">{score}</span>
        <span className="text-[9px] border border-current rounded-full px-1 opacity-70">
          {diffLabel}
        </span>
      </span>
    </div>
  )
}

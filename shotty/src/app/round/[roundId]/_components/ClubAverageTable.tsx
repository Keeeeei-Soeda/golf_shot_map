import type { ClubStat } from '@/types/clubStats'

interface Props {
  stats: ClubStat[]
  showRange?: boolean
}

export function ClubAverageTable({ stats, showRange = false }: Props) {
  if (stats.length === 0) {
    return (
      <div className="bg-white border border-zinc-200/50 rounded-xl p-3.5">
        <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">
          クラブ別 平均飛距離
        </div>
        <p className="text-xs text-zinc-400 py-2">データがありません</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-zinc-200/50 rounded-xl p-3.5">
      <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">
        クラブ別 平均飛距離
      </div>
      <table className="w-full border-collapse text-sm tabular-nums">
        <thead>
          <tr className="text-[11px] text-zinc-500">
            <th className="text-left py-2 pl-1 border-b border-zinc-200/50 font-normal">
              クラブ
            </th>
            <th className="text-right py-2 pr-1 border-b border-zinc-200/50 font-normal">
              平均飛距離
            </th>
            <th className="text-right py-2 pr-1 border-b border-zinc-200/50 font-normal">
              使用回数
            </th>
            {showRange && (
              <th className="text-right py-2 pr-1 border-b border-zinc-200/50 font-normal">
                振れ幅
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {stats.map(s => (
            <tr key={s.club} className="border-b border-zinc-200/50 last:border-0">
              <td className="text-left py-2.5 pl-1 font-medium">{s.club}</td>
              <td className="text-right py-2.5 pr-1">
                <span className="font-medium">{s.avg}</span>
                <span className="text-zinc-500 text-[11px] ml-0.5">y</span>
              </td>
              <td className="text-right py-2.5 pr-1">
                <span>{s.count}</span>
                <span className="text-zinc-500 text-[11px] ml-0.5">回</span>
              </td>
              {showRange && (
                <td className="text-right py-2.5 pr-1 text-zinc-500 text-[11px]">
                  {s.min}〜{s.max}y
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aggregateClubStats } from '@/lib/aggregateClubStats'
import { RoundSummaryCard } from './_components/RoundSummaryCard'
import { ScoreCardSection } from './_components/ScoreCardSection'
import { ClubAverageTable } from './_components/ClubAverageTable'
import type { HoleData, ShotData } from './_components/ScoreCardSection'

export default async function RoundReviewPage({
  params,
}: {
  params: Promise<{ roundId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const { roundId } = await params

  const round = await prisma.round.findFirst({
    where: { id: roundId, userId: session.user.id },
    include: {
      holes: { orderBy: { holeIdx: 'asc' } },
      shots: { orderBy: { shotNo: 'asc' } },
    },
  })

  if (!round) notFound()

  // shots を holeIdx でグループ化
  const shotsByHole = new Map<number, typeof round.shots>()
  for (const s of round.shots) {
    if (!shotsByHole.has(s.holeIdx)) shotsByHole.set(s.holeIdx, [])
    shotsByHole.get(s.holeIdx)!.push(s)
  }

  // RoundHole に shots を付与し、振り返り用の形式に変換
  const holesWithShots: HoleData[] = round.holes
    .filter(h => h.cupIn)
    .map(h => ({
      id: h.id,
      holeNo: h.holeIdx + 1,
      par: h.par,
      score: h.totalShots,
      putts: h.putts,
      shots: (shotsByHole.get(h.holeIdx) ?? []).map((s): ShotData => ({
        id: s.id,
        shotNo: s.shotNo,
        club: s.club,
        carry: s.carry,
        isOB: s.isOB,
        shotType: s.shotType,
        shotFeel: s.shotFeel,
      })),
    }))

  // OUT（1〜9H: holeIdx 0-8）と IN（10〜18H: holeIdx 9-17）に分割
  const outHoles = holesWithShots.filter(h => h.holeNo <= 9)
  const inHoles  = holesWithShots.filter(h => h.holeNo >= 10)

  // クラブ別集計
  const clubStats = aggregateClubStats(round.shots)

  // サマリー計算
  const totalScore = holesWithShots.reduce((sum, h) => sum + h.score, 0)
  const totalPar   = holesWithShots.reduce((sum, h) => sum + h.par, 0)

  return (
    <div
      className="min-h-screen"
      style={{ background: '#fafaf8', color: '#0d1f0d' }}
    >
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/mypage"
            className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            ← マイページに戻る
          </Link>
          <span className="text-zinc-200">|</span>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            マップに戻る
          </Link>
        </div>

        <div className="flex flex-col gap-3.5">
          <RoundSummaryCard
            round={{
              ...round,
              totalScore,
              totalPar,
              completedHoles: holesWithShots.length,
            }}
          />

          {outHoles.length > 0 && (
            <ScoreCardSection side="OUT" holes={outHoles} />
          )}
          {inHoles.length > 0 && (
            <ScoreCardSection side="IN" holes={inHoles} />
          )}

          {holesWithShots.length === 0 && (
            <div className="bg-white border border-zinc-200/50 rounded-xl p-6 text-center text-zinc-400 text-sm">
              まだスコアが記録されていません
            </div>
          )}

          <ClubAverageTable stats={clubStats} showRange />
        </div>
      </div>
    </div>
  )
}

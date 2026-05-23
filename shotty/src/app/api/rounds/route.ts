import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseLocalRound, toLocalFormat, type LocalRound } from '@/lib/round-mapper'

// GET: 自分のラウンド一覧（Freeプランは最新5件）
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  })

  const limit = user?.subscription?.status === 'ACTIVE' ? undefined : 5

  const rounds = await prisma.round.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: limit,
    include: { holes: true, shots: true },
  })

  const totalCount = await prisma.round.count({ where: { userId: session.user.id } })

  return NextResponse.json({
    rounds: rounds.map(toLocalFormat),
    isLimited: !!limit,
    totalCount,
  })
}

// POST: ラウンド新規作成
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const local = (await req.json()) as LocalRound
    const parsed = parseLocalRound(local)

    const created = await prisma.round.create({
      data: {
        userId: session.user.id,
        date: parsed.date,
        gcName: parsed.gcName,
        courseName: parsed.courseName,
        firstCIdx: parsed.firstCIdx ?? null,
        secondCIdx: parsed.secondCIdx ?? null,
        holes: { create: parsed.holes },
        shots: { create: parsed.shots },
      },
      include: { holes: true, shots: true },
    })

    return NextResponse.json({ round: toLocalFormat(created) })
  } catch (error) {
    console.error('[/api/rounds POST]', error)
    return NextResponse.json({ error: 'Failed to create round' }, { status: 500 })
  }
}

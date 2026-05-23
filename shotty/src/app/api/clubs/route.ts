import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: クラブセット取得
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clubs = await prisma.club.findMany({
    where: { userId: session.user.id },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ clubs: clubs.map((c) => c.name) })
}

// PUT: クラブセット一括上書き
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { clubs } = (await req.json()) as { clubs: string[] }
    if (!Array.isArray(clubs) || clubs.length > 14) {
      return NextResponse.json({ error: 'Invalid clubs' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.club.deleteMany({ where: { userId: session.user.id } })
      await tx.club.createMany({
        data: clubs.map((name, idx) => ({
          userId: session.user.id,
          name,
          order: idx,
        })),
      })
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[/api/clubs PUT]', error)
    return NextResponse.json({ error: 'Failed to update clubs' }, { status: 500 })
  }
}

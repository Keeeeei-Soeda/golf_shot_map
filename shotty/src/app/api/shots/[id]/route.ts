import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH: ショットのタグ情報を更新（isOB / shotType / shotFeel）
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // ショットが自分のものか確認
  const shot = await prisma.shot.findFirst({
    where: { id },
    include: { round: { select: { userId: true } } },
  })

  if (!shot || shot.round.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const isOB     = typeof body.isOB     === 'boolean'      ? body.isOB     : undefined
  const shotType = 'shotType' in body ? (body.shotType ?? null) : undefined
  const shotFeel = 'shotFeel' in body ? (body.shotFeel ?? null) : undefined

  const updated = await prisma.shot.update({
    where: { id },
    data: {
      ...(isOB     !== undefined && { isOB }),
      ...(shotType !== undefined && { shotType }),
      ...(shotFeel !== undefined && { shotFeel }),
    },
  })

  return NextResponse.json({ shot: updated })
}

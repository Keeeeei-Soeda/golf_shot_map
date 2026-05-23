import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toLocalFormat } from '@/lib/round-mapper'

// GET: 1ラウンド詳細
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const round = await prisma.round.findFirst({
    where: { id, userId: session.user.id },
    include: { holes: true, shots: true },
  })

  if (!round) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ round: toLocalFormat(round) })
}

// DELETE: ラウンド削除
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const round = await prisma.round.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!round) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.round.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[/api/rounds/[id] DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

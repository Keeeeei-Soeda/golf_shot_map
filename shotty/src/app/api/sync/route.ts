import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseLocalRound, type LocalRound } from '@/lib/round-mapper'

/**
 * localStorage のデータを DB に一括投入する。
 * 1件失敗しても他を続行。localStorage は消さない（クライアント側に委ねる）。
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rounds, clubs } = (await req.json()) as {
      rounds?: LocalRound[]
      clubs?: string[]
    }

    let importedRounds = 0
    let importedClubs = 0

    // ラウンドの一括投入
    if (rounds && Array.isArray(rounds)) {
      for (const local of rounds) {
        try {
          const parsed = parseLocalRound(local)
          await prisma.round.create({
            data: {
              userId: session.user.id,
              date: parsed.date,
              gcName: parsed.gcName,
              courseName: parsed.courseName,
              holes: { create: parsed.holes },
              shots: { create: parsed.shots },
            },
          })
          importedRounds++
        } catch (e) {
          console.error('[/api/sync] round import failed:', local.id, e)
        }
      }
    }

    // クラブセットの投入（既存を置き換え）
    if (clubs && Array.isArray(clubs) && clubs.length > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.club.deleteMany({ where: { userId: session.user.id } })
        await tx.club.createMany({
          data: clubs.slice(0, 14).map((name, idx) => ({
            userId: session.user.id,
            name,
            order: idx,
          })),
        })
      })
      importedClubs = clubs.length
    }

    return NextResponse.json({
      ok: true,
      imported: { rounds: importedRounds, clubs: importedClubs },
    })
  } catch (error) {
    console.error('[/api/sync]', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

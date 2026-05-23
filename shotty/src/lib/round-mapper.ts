import type { Round, RoundHole, Shot } from '@prisma/client'

// ============================================
// localStorage のデータ型（既存の形式を維持）
// ============================================

export type LocalShot = {
  no: number
  club: string
  carry: number
  remaining: number
  lat: number
  lng: number
  fromLabel?: string
  evalTag?: string
  penalty?: string
  // ★振り返りタグ
  isOB?: boolean
  shotType?: string | null
  shotFeel?: string | null
}

export type LocalMeta = {
  cupIn: boolean
  scoreDiff: number
  par: number
  totalShots: number
  putts?: number
}

export type LocalRound = {
  id: string
  date: string        // "2026/3/25"
  gcName: string
  courseName: string
  // ★ ラウンド構成のcIdx順序（RF-5で追加）
  firstCIdx?: number  // 最初の9ホールのcIdx
  secondCIdx?: number // 次の9ホールのcIdx
  shots: Record<string, LocalShot[] | LocalMeta>
  updatedAt?: number
}

// DB → フロントで使う表示用
export type RoundView = {
  id: string
  date: string
  gcName: string
  courseName: string
  firstCIdx?: number
  secondCIdx?: number
  shots: Record<string, LocalShot | LocalMeta | (LocalShot | LocalMeta)[]>
}

// ============================================
// localStorage → DB 投入用に変換
// ============================================
export function parseLocalRound(local: LocalRound) {
  const holes: Array<{
    holeIdx: number
    par: number
    totalShots: number
    scoreDiff: number
    cupIn: boolean
    putts: number | null
  }> = []

  const shots: Array<{
    holeIdx: number
    shotNo: number
    club: string
    lat: number
    lng: number
    carry: number | null
    remaining: number | null
    fromLabel: string | null
    evalTag: string | null
    penalty: string | null
    isOB: boolean
    shotType: string | null
    shotFeel: string | null
  }> = []

  const firstCIdx = local.firstCIdx
  const secondCIdx = local.secondCIdx

  for (const [key, value] of Object.entries(local.shots)) {
    const isMeta = key.endsWith('_meta')
    const baseKey = isMeta ? key.replace('_meta', '') : key
    const parts = baseKey.split('_')
    const cIdxInKey = parseInt(parts[1] ?? '0', 10)
    const hIdxInKey = parseInt(parts[2] ?? '0', 10)

    // holeIdx を 0-17 の通し番号に正規化
    let globalHoleIdx: number
    if (firstCIdx !== undefined && cIdxInKey === firstCIdx) {
      globalHoleIdx = hIdxInKey          // 0-8
    } else if (secondCIdx !== undefined && cIdxInKey === secondCIdx) {
      globalHoleIdx = hIdxInKey + 9     // 9-17
    } else {
      // 旧形式（firstCIdx/secondCIdx なし）はそのまま
      globalHoleIdx = hIdxInKey
    }

    if (isMeta) {
      const meta = value as LocalMeta
      holes.push({
        holeIdx: globalHoleIdx,
        par: meta.par,
        totalShots: meta.totalShots,
        scoreDiff: meta.scoreDiff,
        cupIn: meta.cupIn,
        putts: meta.putts ?? null,
      })
    } else {
      const localShots = value as LocalShot[]
      if (!Array.isArray(localShots)) continue
      for (const s of localShots) {
        shots.push({
          holeIdx: globalHoleIdx,
          shotNo: s.no,
          club: s.club,
          lat: s.lat,
          lng: s.lng,
          carry: s.carry ?? null,
          remaining: s.remaining ?? null,
          fromLabel: s.fromLabel ?? null,
          evalTag: s.evalTag ?? null,
          penalty: s.penalty ?? null,
          isOB: s.isOB ?? false,
          shotType: s.shotType ?? null,
          shotFeel: s.shotFeel ?? null,
        })
      }
    }
  }

  // 日付パース: "2026/3/25" or "2026-03-25" など
  const dateStr = local.date.replace(/\//g, '-')
  const parsed = new Date(dateStr)
  const date = isNaN(parsed.getTime()) ? new Date() : parsed

  return {
    date,
    gcName: local.gcName,
    courseName: local.courseName,
    firstCIdx: local.firstCIdx ?? null,
    secondCIdx: local.secondCIdx ?? null,
    holes,
    shots,
  }
}

// ============================================
// DB → localStorage 形式に変換（表示用）
// ============================================
export function toLocalFormat(
  round: Round & { holes: RoundHole[]; shots: Shot[] }
): RoundView {
  const shots: Record<string, LocalShot | LocalMeta | (LocalShot | LocalMeta)[]> = {}

  // firstCIdx/secondCIdx を使ってキーを生成
  const firstCIdx = (round as Round & { firstCIdx?: number | null }).firstCIdx ?? 0
  const secondCIdx = (round as Round & { secondCIdx?: number | null }).secondCIdx ?? 1

  const shotsByHole = new Map<number, Shot[]>()
  for (const s of round.shots) {
    if (!shotsByHole.has(s.holeIdx)) shotsByHole.set(s.holeIdx, [])
    shotsByHole.get(s.holeIdx)!.push(s)
  }

  for (const [holeIdx, holeShots] of Array.from(shotsByHole)) {
    // holeIdx 0-8 → first, 9-17 → second
    const cIdx = holeIdx < 9 ? firstCIdx : secondCIdx
    const localHIdx = holeIdx < 9 ? holeIdx : holeIdx - 9
    const key = `0_${cIdx}_${localHIdx}`
    shots[key] = holeShots
      .sort((a, b) => a.shotNo - b.shotNo)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s) => ({
        no: s.shotNo,
        club: s.club,
        carry: s.carry ?? 0,
        remaining: s.remaining ?? 0,
        lat: s.lat,
        lng: s.lng,
        fromLabel: s.fromLabel ?? undefined,
        evalTag: s.evalTag ?? undefined,
        penalty: s.penalty ?? undefined,
        isOB: s.isOB,
        shotType: s.shotType ?? undefined,
        shotFeel: s.shotFeel ?? undefined,
      })) as LocalShot[]
  }

  for (const h of round.holes) {
    const cIdx = h.holeIdx < 9 ? firstCIdx : secondCIdx
    const localHIdx = h.holeIdx < 9 ? h.holeIdx : h.holeIdx - 9
    const key = `0_${cIdx}_${localHIdx}_meta`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shots[key] = {
      cupIn: h.cupIn,
      scoreDiff: h.scoreDiff,
      par: h.par,
      totalShots: h.totalShots,
      putts: h.putts ?? undefined,
    } as unknown as LocalMeta
  }

  return {
    id: round.id,
    date: round.date.toISOString().split('T')[0].replace(/-/g, '/'),
    gcName: round.gcName,
    courseName: round.courseName,
    firstCIdx,
    secondCIdx,
    shots,
  }
}

export function haversine(
  la1: number, lo1: number,
  la2: number, lo2: number
): number {
  const R = 6371000
  const r = Math.PI / 180
  const dL = (la2 - la1) * r
  const dN = (lo2 - lo1) * r
  const a =
    Math.sin(dL / 2) ** 2 +
    Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dN / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function haversineYards(
  la1: number, lo1: number,
  la2: number, lo2: number
): number {
  return Math.round(haversine(la1, lo1, la2, lo2) * 1.09361)
}

export function calcBearing(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const r = Math.PI / 180
  const dLng = (lng2 - lng1) * r
  const y = Math.sin(dLng) * Math.cos(lat2 * r)
  const x =
    Math.cos(lat1 * r) * Math.sin(lat2 * r) -
    Math.sin(lat1 * r) * Math.cos(lat2 * r) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

export function scoreDef(diff: number) {
  const SCORE_DEFS = [
    { diff: -2, name: 'イーグル',     cls: 'eagle'  },
    { diff: -1, name: 'バーディ',     cls: 'birdie' },
    { diff:  0, name: 'パー',         cls: 'par'    },
    { diff:  1, name: 'ボギー',       cls: 'bogey'  },
    { diff:  2, name: 'ダブルボギー', cls: 'dbl'    },
    { diff:  3, name: 'トリプルボギー', cls: 'tpl'  },
  ]
  return SCORE_DEFS.find(d => d.diff === diff) ?? { diff, name: '+' + diff, cls: 'other' }
}

export interface ClubStat {
  /** クラブ名（例: '5I', '56°'） */
  club: string
  /** 平均飛距離（y、整数） */
  avg: number
  /** 使用回数（OB と carry=null は除外したカウント） */
  count: number
  /** 最小飛距離（y） */
  min: number
  /** 最大飛距離（y） */
  max: number
  /** 標準偏差（y） — AIキャディでのバラつき分析用 */
  stddev: number
}

export interface ClubStatsOptions {
  /** パターを集計に含めるか（デフォルト false） */
  includePutter?: boolean
  /** OB ショットを含めるか（デフォルト false） */
  includeOB?: boolean
}

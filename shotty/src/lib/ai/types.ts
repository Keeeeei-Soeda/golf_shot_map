export type AiResponse = {
  text: string
  model: string
  tokensUsed?: {
    input: number
    output: number
  }
}

export type CaddyContext = {
  rounds?: Array<{
    date: string
    gcName: string
    courseName: string
    totalScore?: number
    holes: Array<{ holeNo: number; par: number; score: number; diff?: string }>
  }>
  clubs?: Array<{ name: string; avgDist?: number; maxDist?: number }>
  currentHole?: { par: number; yards: number; courseName: string }
}

export type ClubData = {
  name: string
  avgDist?: number
  maxDist?: number
}

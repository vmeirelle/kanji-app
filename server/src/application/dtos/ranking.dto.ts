export type SubmitScoreInput = {
  userId: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: Date
}

export type ListRankingsInput = {
  day?: string
  level?: string
}

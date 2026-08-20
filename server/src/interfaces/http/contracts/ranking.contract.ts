import { z } from 'zod'

export const submitScoreBodySchema = z.object({
  level: z.string().trim().min(1).max(16),
  correct: z.number().int().min(0),
  total: z.number().int().min(0),
  points: z.number().int().min(0).max(100000),
})

export const listRankingsQuerySchema = z.object({
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  level: z.string().trim().min(1).max(16).optional(),
})

export type SubmitScoreBody = z.infer<typeof submitScoreBodySchema>
export type ListRankingsQuery = z.infer<typeof listRankingsQuerySchema>

export type RankingItemResponse = {
  id: string
  username: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: string
}

export type ListRankingsResponse = {
  rankings: RankingItemResponse[]
}

export type CreatedRanking = {
  id: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: string
}

export type SubmitScoreResponse = {
  ranking: CreatedRanking
}

import type { Ranking, RankingWithUser } from '../entities/Ranking.js'

export type CreateRankingData = {
  userId: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: Date
}

export type RankingListFilter = {
  day?: string
  level?: string
}

export interface RankingRepository {
  create(data: CreateRankingData): Promise<Ranking>
  list(filter: RankingListFilter): Promise<RankingWithUser[]>
}

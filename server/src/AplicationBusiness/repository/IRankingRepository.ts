import { Result } from 'ts-results'
import Ranking, { RankingWithUser } from '../../EnterpriseBusiness/entities/Ranking'
import DatabaseError from '../../EnterpriseBusiness/errors/DatabaseError'

export interface CreateRankingData {
  userId: number
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: Date
}

export interface RankingListFilter {
  day?: string
  level?: string
}

export default interface IRankingRepository {
  create(data: CreateRankingData): Promise<Result<Ranking, DatabaseError>>
  list(filter: RankingListFilter): Promise<Result<RankingWithUser[], DatabaseError>>
}

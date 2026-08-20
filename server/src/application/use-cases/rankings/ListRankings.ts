import type { RankingRepository } from '../../../domain/repositories/RankingRepository.js'
import type { RankingWithUser } from '../../../domain/entities/Ranking.js'
import type { ListRankingsInput } from '../../dtos/ranking.dto.js'

export interface ListRankingsUseCase {
  execute(input: ListRankingsInput): Promise<RankingWithUser[]>
}

export class ListRankings implements ListRankingsUseCase {
  constructor(private readonly rankings: RankingRepository) {}

  execute(input: ListRankingsInput): Promise<RankingWithUser[]> {
    return this.rankings.list(input)
  }
}

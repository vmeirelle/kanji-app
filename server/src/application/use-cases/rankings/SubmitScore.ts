import type { RankingRepository } from '../../../domain/repositories/RankingRepository.js'
import type { Ranking } from '../../../domain/entities/Ranking.js'
import type { SubmitScoreInput } from '../../dtos/ranking.dto.js'

export interface SubmitScoreUseCase {
  execute(input: SubmitScoreInput): Promise<Ranking>
}

export class SubmitScore implements SubmitScoreUseCase {
  constructor(private readonly rankings: RankingRepository) {}

  execute(input: SubmitScoreInput): Promise<Ranking> {
    return this.rankings.create(input)
  }
}

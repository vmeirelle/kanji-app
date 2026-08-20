import type { Context } from 'hono'
import type { SubmitScoreUseCase } from '../../../application/use-cases/rankings/SubmitScore.js'
import type { ListRankingsUseCase } from '../../../application/use-cases/rankings/ListRankings.js'
import type { Ranking, RankingWithUser } from '../../../domain/entities/Ranking.js'
import {
  listRankingsQuerySchema,
  submitScoreBodySchema,
  type CreatedRanking,
  type ListRankingsResponse,
  type RankingItemResponse,
  type SubmitScoreResponse,
} from '../contracts/ranking.contract.js'
import type { AppEnv } from '../types.js'

export interface RankingController {
  list(c: Context<AppEnv>): Promise<Response>
  submit(c: Context<AppEnv>): Promise<Response>
}

export class HttpRankingController implements RankingController {
  constructor(
    private readonly listRankings: ListRankingsUseCase,
    private readonly submitScore: SubmitScoreUseCase,
  ) {}

  async list(c: Context<AppEnv>): Promise<Response> {
    const query = listRankingsQuerySchema.parse(c.req.query())
    const rankings = await this.listRankings.execute(query)
    const response: ListRankingsResponse = { rankings: rankings.map(toRankingItem) }
    return c.json(response, 200)
  }

  async submit(c: Context<AppEnv>): Promise<Response> {
    const body = submitScoreBodySchema.parse(await c.req.json())
    const now = new Date()
    const day = now.toISOString().slice(0, 10)
    const ranking = await this.submitScore.execute({
      userId: c.get('userId'),
      level: body.level,
      correct: body.correct,
      total: body.total,
      points: body.points,
      day,
      date: now,
    })
    const response: SubmitScoreResponse = { ranking: toCreatedRanking(ranking) }
    return c.json(response, 201)
  }
}

function toRankingItem(ranking: RankingWithUser): RankingItemResponse {
  return {
    id: ranking.id,
    username: ranking.username,
    level: ranking.level,
    correct: ranking.correct,
    total: ranking.total,
    points: ranking.points,
    day: ranking.day,
    date: ranking.date.toISOString(),
  }
}

function toCreatedRanking(ranking: Ranking): CreatedRanking {
  return {
    id: ranking.id,
    level: ranking.level,
    correct: ranking.correct,
    total: ranking.total,
    points: ranking.points,
    day: ranking.day,
    date: ranking.date.toISOString(),
  }
}

import { Ok } from 'ts-results'
import { HttpController } from './HttpController'
import { authenticate } from './authenticate'
import { Get, Post, Route } from '../../gateway/http/HttpServer'
import { HttpRequest, HttpResult, HttpStatus } from '../../gateway/http/Http.types'
import { IListRankingsUseCase } from '../../../EnterpriseBusiness/useCases/rankings/ListRankingsUseCase'
import {
  ISubmitScoreUseCase,
  SubmitScoreResult,
} from '../../../EnterpriseBusiness/useCases/rankings/SubmitScoreUseCase'
import { RankingWithUser } from '../../../EnterpriseBusiness/entities/Ranking'
import ITokenService from '../../../AplicationBusiness/services/ITokenService'

interface RankingItemResponse {
  id: number
  username: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: string
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

function toCreatedRanking(ranking: SubmitScoreResult) {
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

@Route('/api')
export default class RankingHttpApiController extends HttpController {
  constructor(
    readonly listRankingsUseCase: IListRankingsUseCase,
    readonly submitScoreUseCase: ISubmitScoreUseCase,
    readonly tokenService: ITokenService,
  ) {
    super()
  }

  @Get('/rankings')
  async list(req: HttpRequest): Promise<HttpResult> {
    const query = req.query as { day?: string; level?: string }
    const result = await this.listRankingsUseCase.execute({ day: query.day, level: query.level })
    if (result.err) return result
    return Ok({
      status: HttpStatus.ok,
      body: { rankings: result.unwrap().map(toRankingItem) },
    })
  }

  @Post('/rankings')
  async submit(req: HttpRequest): Promise<HttpResult> {
    const auth = authenticate(req, this.tokenService)
    if (auth.err) return auth
    const body = req.body as { level: string; correct: number; total: number; points: number }
    const result = await this.submitScoreUseCase.execute({
      userId: auth.val,
      level: body.level,
      correct: body.correct,
      total: body.total,
      points: body.points,
    })
    if (result.err) return result
    return Ok({
      status: HttpStatus.created,
      body: { ranking: toCreatedRanking(result.unwrap()) },
    })
  }
}

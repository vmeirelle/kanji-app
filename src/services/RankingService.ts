import { httpClient, type HttpClient } from './HttpClient'

export type RankingItem = {
  id: number
  username: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: string
}

export type ScoreInput = {
  level: string
  correct: number
  total: number
  points: number
}

export type RankingListParams = {
  day?: string
  level?: string
}

export interface IRankingService {
  list(params?: RankingListParams): Promise<RankingItem[]>
  submit(token: string, score: ScoreInput): Promise<void>
}

class RankingService implements IRankingService {
  constructor(private readonly http: HttpClient) {}

  async list(params: RankingListParams = {}): Promise<RankingItem[]> {
    const query = new URLSearchParams()
    if (params.day) query.set('day', params.day)
    if (params.level) query.set('level', params.level)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    const result = await this.http.get<{ rankings: RankingItem[] }>(`/rankings${suffix}`)
    return result.rankings
  }

  async submit(token: string, score: ScoreInput): Promise<void> {
    await this.http.post('/rankings', score, token)
  }
}

export const rankingService: IRankingService = new RankingService(httpClient)

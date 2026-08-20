import type { PrismaClient } from '@prisma/client'
import { Ranking, type RankingWithUser } from '../../domain/entities/Ranking.js'
import type {
  CreateRankingData,
  RankingListFilter,
  RankingRepository,
} from '../../domain/repositories/RankingRepository.js'

export class PrismaRankingRepository implements RankingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateRankingData): Promise<Ranking> {
    const row = await this.prisma.ranking.create({ data })
    return new Ranking(
      row.id,
      row.userId,
      row.level,
      row.correct,
      row.total,
      row.points,
      row.day,
      row.date,
    )
  }

  async list(filter: RankingListFilter): Promise<RankingWithUser[]> {
    const rows = await this.prisma.ranking.findMany({
      where: { day: filter.day, level: filter.level },
      orderBy: { points: 'desc' },
      include: { user: { select: { username: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      username: row.user.username,
      level: row.level,
      correct: row.correct,
      total: row.total,
      points: row.points,
      day: row.day,
      date: row.date,
    }))
  }
}

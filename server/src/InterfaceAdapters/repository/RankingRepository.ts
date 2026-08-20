import { Ok, Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import { Repository } from 'typeorm'
import IRankingRepository, {
  CreateRankingData,
  RankingListFilter,
} from '../../AplicationBusiness/repository/IRankingRepository'
import Ranking, { RankingWithUser } from '../../EnterpriseBusiness/entities/Ranking'
import DatabaseError from '../../EnterpriseBusiness/errors/DatabaseError'
import RankingModel from './models/main/RankingModel'

function toDomain(model: RankingModel): Ranking {
  return new Ranking(
    model.id,
    model.userId,
    model.level,
    model.correct,
    model.total,
    model.points,
    model.day,
    model.date,
  )
}

@injectable()
export default class RankingRepository implements IRankingRepository {
  constructor(@inject('RankingModel') private readonly model: Repository<RankingModel>) {}

  async create(data: CreateRankingData): Promise<Result<Ranking, DatabaseError>> {
    try {
      const row = this.model.create(data)
      const saved = await this.model.save(row)
      return Ok(toDomain(saved))
    } catch (e) {
      console.error('RankingRepository.create', e)
      return Err(new DatabaseError())
    }
  }

  async list(filter: RankingListFilter): Promise<Result<RankingWithUser[], DatabaseError>> {
    try {
      const query = this.model
        .createQueryBuilder('ranking')
        .leftJoinAndSelect('ranking.user', 'user')
        .orderBy('ranking.points', 'DESC')

      if (filter.day) query.andWhere('ranking.day = :day', { day: filter.day })
      if (filter.level) query.andWhere('ranking.level = :level', { level: filter.level })

      const rows = await query.getMany()
      return Ok(
        rows.map((row) => ({
          id: row.id,
          username: row.user.username,
          level: row.level,
          correct: row.correct,
          total: row.total,
          points: row.points,
          day: row.day,
          date: row.date,
        })),
      )
    } catch (e) {
      console.error('RankingRepository.list', e)
      return Err(new DatabaseError())
    }
  }
}

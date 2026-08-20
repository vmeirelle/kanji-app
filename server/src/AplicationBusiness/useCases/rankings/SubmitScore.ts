import { Ok, Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import {
  ISubmitScoreUseCase,
  SubmitScoreErrors,
  SubmitScoreForm,
  SubmitScoreResult,
} from '../../../EnterpriseBusiness/useCases/rankings/SubmitScoreUseCase'
import IRankingRepository from '../../repository/IRankingRepository'
import DatabaseError from '../../../EnterpriseBusiness/errors/DatabaseError'
import ValidateForm from '../../decorators/ValidateForm'
import validators from '../../validators/Validators'

@injectable()
export default class SubmitScore implements ISubmitScoreUseCase {
  constructor(@inject('RankingRepository') readonly rankingRepository: IRankingRepository) {}

  @ValidateForm({
    level: validators.level(),
    correct: validators.intMin(0),
    total: validators.intMin(0),
    points: validators.points(),
  })
  async execute(form: SubmitScoreForm): Promise<Result<SubmitScoreResult, SubmitScoreErrors>> {
    const now = new Date()
    const day = now.toISOString().slice(0, 10)
    const created = await this.rankingRepository.create({
      userId: form.userId,
      level: form.level,
      correct: form.correct,
      total: form.total,
      points: form.points,
      day,
      date: now,
    })
    if (created.err) return Err(new DatabaseError())

    const ranking = created.val
    return Ok({
      id: ranking.id,
      level: ranking.level,
      correct: ranking.correct,
      total: ranking.total,
      points: ranking.points,
      day: ranking.day,
      date: ranking.date,
    })
  }
}

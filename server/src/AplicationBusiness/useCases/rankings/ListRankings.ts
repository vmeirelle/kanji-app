import { Ok, Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import {
  IListRankingsUseCase,
  ListRankingsErrors,
  ListRankingsForm,
} from '../../../EnterpriseBusiness/useCases/rankings/ListRankingsUseCase'
import { RankingWithUser } from '../../../EnterpriseBusiness/entities/Ranking'
import IRankingRepository from '../../repository/IRankingRepository'
import DatabaseError from '../../../EnterpriseBusiness/errors/DatabaseError'
import ValidateForm from '../../decorators/ValidateForm'
import validators from '../../validators/Validators'

@injectable()
export default class ListRankings implements IListRankingsUseCase {
  constructor(@inject('RankingRepository') readonly rankingRepository: IRankingRepository) {}

  @ValidateForm({
    day: validators.optionalDay(),
    level: validators.optionalLevel(),
  })
  async execute(form: ListRankingsForm): Promise<Result<RankingWithUser[], ListRankingsErrors>> {
    const listed = await this.rankingRepository.list({ day: form.day, level: form.level })
    if (listed.err) return Err(new DatabaseError())
    return Ok(listed.val)
  }
}

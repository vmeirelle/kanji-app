import UseCase from '../useCase'
import FormError from '../../errors/form/FormError'
import DatabaseError from '../../errors/DatabaseError'
import { RankingWithUser } from '../../entities/Ranking'

export interface ListRankingsForm {
  day?: string
  level?: string
}

export type ListRankingsErrors = FormError | DatabaseError

export type IListRankingsUseCase = UseCase<ListRankingsForm, RankingWithUser[], ListRankingsErrors>

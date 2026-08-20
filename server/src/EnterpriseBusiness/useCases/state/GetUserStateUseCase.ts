import UseCase from '../useCase'
import DatabaseError from '../../errors/DatabaseError'

export interface GetUserStateForm {
  userId: number
}

export type GetUserStateErrors = DatabaseError

export type IGetUserStateUseCase = UseCase<GetUserStateForm, string | null, GetUserStateErrors>

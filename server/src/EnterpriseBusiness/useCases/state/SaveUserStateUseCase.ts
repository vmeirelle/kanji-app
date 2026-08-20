import UseCase from '../useCase'
import DatabaseError from '../../errors/DatabaseError'

export interface SaveUserStateForm {
  userId: number
  state: string
}

export type SaveUserStateErrors = DatabaseError

export type ISaveUserStateUseCase = UseCase<SaveUserStateForm, void, SaveUserStateErrors>

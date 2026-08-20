import UseCase from '../useCase'
import DatabaseError from '../../errors/DatabaseError'
import NotFoundError from '../../errors/NotFoundError'

export interface GetMeForm {
  userId: number
}

export interface PublicUser {
  id: number
  username: string
  createdAt: Date
}

export type GetMeErrors = DatabaseError | NotFoundError

export type IGetMeUseCase = UseCase<GetMeForm, PublicUser, GetMeErrors>

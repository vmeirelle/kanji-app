import UseCase from '../useCase'
import FormError from '../../errors/form/FormError'
import DatabaseError from '../../errors/DatabaseError'
import UsernameTakenError from '../../errors/UsernameTakenError'

export interface RegisterUserForm {
  username: string
  password: string
}

export interface AuthResult {
  user: {
    id: number
    username: string
    createdAt: Date
  }
  token: string
}

export type RegisterUserErrors = FormError | DatabaseError | UsernameTakenError

export type IRegisterUserUseCase = UseCase<RegisterUserForm, AuthResult, RegisterUserErrors>

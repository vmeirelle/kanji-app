import UseCase from '../useCase'
import FormError from '../../errors/form/FormError'
import DatabaseError from '../../errors/DatabaseError'
import LoginInvalidError from '../../errors/LoginInvalidError'
import { AuthResult } from './RegisterUserUseCase'

export interface LoginUserForm {
  username: string
  password: string
}

export type LoginUserErrors = FormError | DatabaseError | LoginInvalidError

export type ILoginUserUseCase = UseCase<LoginUserForm, AuthResult, LoginUserErrors>

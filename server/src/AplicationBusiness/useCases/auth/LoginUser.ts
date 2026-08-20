import { Ok, Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import {
  ILoginUserUseCase,
  LoginUserErrors,
  LoginUserForm,
} from '../../../EnterpriseBusiness/useCases/auth/LoginUserUseCase'
import { AuthResult } from '../../../EnterpriseBusiness/useCases/auth/RegisterUserUseCase'
import IUserRepository from '../../repository/IUserRepository'
import IHashService from '../../services/IHashService'
import ITokenService from '../../services/ITokenService'
import DatabaseError from '../../../EnterpriseBusiness/errors/DatabaseError'
import LoginInvalidError from '../../../EnterpriseBusiness/errors/LoginInvalidError'
import ValidateForm from '../../decorators/ValidateForm'
import validators from '../../validators/Validators'

@injectable()
export default class LoginUser implements ILoginUserUseCase {
  constructor(
    @inject('UserRepository') readonly userRepository: IUserRepository,
    @inject('HashService') readonly hashService: IHashService,
    @inject('TokenService') readonly tokenService: ITokenService,
  ) {}

  @ValidateForm({
    username: validators.requiredString(),
    password: validators.password(),
  })
  async execute(form: LoginUserForm): Promise<Result<AuthResult, LoginUserErrors>> {
    const found = await this.userRepository.findByUsername(form.username)
    if (found.err) return Err(new DatabaseError())
    if (!found.val) return Err(new LoginInvalidError(form.username))

    const user = found.val
    if (!this.hashService.comparePassword(form.password, user.passwordHash)) {
      return Err(new LoginInvalidError(form.username))
    }

    const token = this.tokenService.generateAccessToken(user.id)
    return Ok({
      user: { id: user.id, username: user.username, createdAt: user.createdAt },
      token,
    })
  }
}

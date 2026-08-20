import { Ok, Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import {
  AuthResult,
  IRegisterUserUseCase,
  RegisterUserErrors,
  RegisterUserForm,
} from '../../../EnterpriseBusiness/useCases/auth/RegisterUserUseCase'
import IUserRepository from '../../repository/IUserRepository'
import IHashService from '../../services/IHashService'
import ITokenService from '../../services/ITokenService'
import DatabaseError from '../../../EnterpriseBusiness/errors/DatabaseError'
import UsernameTakenError from '../../../EnterpriseBusiness/errors/UsernameTakenError'
import ValidateForm from '../../decorators/ValidateForm'
import validators from '../../validators/Validators'

@injectable()
export default class RegisterUser implements IRegisterUserUseCase {
  constructor(
    @inject('UserRepository') readonly userRepository: IUserRepository,
    @inject('HashService') readonly hashService: IHashService,
    @inject('TokenService') readonly tokenService: ITokenService,
  ) {}

  @ValidateForm({
    username: validators.username(),
    password: validators.password(),
  })
  async execute(form: RegisterUserForm): Promise<Result<AuthResult, RegisterUserErrors>> {
    const existing = await this.userRepository.findByUsername(form.username)
    if (existing.err) return Err(new DatabaseError())
    if (existing.val) return Err(new UsernameTakenError(form.username))

    const passwordHash = this.hashService.hashPassword(form.password)
    const created = await this.userRepository.create({
      username: form.username,
      passwordHash,
    })
    if (created.err) return Err(new DatabaseError())

    const user = created.val
    const token = this.tokenService.generateAccessToken(user.id)
    return Ok({
      user: { id: user.id, username: user.username, createdAt: user.createdAt },
      token,
    })
  }
}

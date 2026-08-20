import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import { InvalidCredentialsError } from '../../../domain/errors/DomainError.js'
import type { PasswordHasher } from '../../ports/PasswordHasher.js'
import type { TokenService } from '../../ports/TokenService.js'
import type { AuthResult, LoginInput } from '../../dtos/auth.dto.js'

export interface LoginUserUseCase {
  execute(input: LoginInput): Promise<AuthResult>
}

export class LoginUser implements LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByUsername(input.username)
    if (!user) throw new InvalidCredentialsError()

    const ok = await this.hasher.verify(input.password, user.passwordHash)
    if (!ok) throw new InvalidCredentialsError()

    const token = await this.tokens.sign({ userId: user.id })
    return { user: user.toPublic(), token }
  }
}

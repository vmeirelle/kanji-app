import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import { UsernameTakenError } from '../../../domain/errors/DomainError.js'
import type { PasswordHasher } from '../../ports/PasswordHasher.js'
import type { TokenService } from '../../ports/TokenService.js'
import type { AuthResult, RegisterInput } from '../../dtos/auth.dto.js'

export interface RegisterUserUseCase {
  execute(input: RegisterInput): Promise<AuthResult>
}

export class RegisterUser implements RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.users.findByUsername(input.username)
    if (existing) throw new UsernameTakenError(input.username)

    const passwordHash = await this.hasher.hash(input.password)
    const user = await this.users.create({ username: input.username, passwordHash })
    const token = await this.tokens.sign({ userId: user.id })

    return { user: user.toPublic(), token }
  }
}

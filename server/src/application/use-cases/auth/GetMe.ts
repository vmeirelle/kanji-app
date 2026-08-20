import type { UserRepository } from '../../../domain/repositories/UserRepository.js'
import { UserNotFoundError } from '../../../domain/errors/DomainError.js'
import type { PublicUser } from '../../../domain/entities/User.js'

export interface GetMeUseCase {
  execute(userId: string): Promise<PublicUser>
}

export class GetMe implements GetMeUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId)
    if (!user) throw new UserNotFoundError()
    return user.toPublic()
  }
}

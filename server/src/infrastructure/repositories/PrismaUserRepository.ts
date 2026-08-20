import type { PrismaClient } from '@prisma/client'
import { User } from '../../domain/entities/User.js'
import type { CreateUserData, UserRepository } from '../../domain/repositories/UserRepository.js'

type UserRow = {
  id: string
  username: string
  passwordHash: string
  createdAt: Date
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { username } })
    return row ? this.toEntity(row) : null
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async create(data: CreateUserData): Promise<User> {
    const row = await this.prisma.user.create({ data })
    return this.toEntity(row)
  }

  private toEntity(row: UserRow): User {
    return new User(row.id, row.username, row.passwordHash, row.createdAt)
  }
}

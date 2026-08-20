import type { User } from '../entities/User.js'

export type CreateUserData = {
  username: string
  passwordHash: string
}

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
}

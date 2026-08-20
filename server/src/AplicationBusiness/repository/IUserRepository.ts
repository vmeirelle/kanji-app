import { Result } from 'ts-results'
import User from '../../EnterpriseBusiness/entities/User'
import DatabaseError from '../../EnterpriseBusiness/errors/DatabaseError'

export interface CreateUserData {
  username: string
  passwordHash: string
}

export default interface IUserRepository {
  findByUsername(username: string): Promise<Result<User | null, DatabaseError>>
  findById(id: number): Promise<Result<User | null, DatabaseError>>
  create(data: CreateUserData): Promise<Result<User, DatabaseError>>
  getState(userId: number): Promise<Result<string | null, DatabaseError>>
  saveState(userId: number, state: string): Promise<Result<void, DatabaseError>>
}

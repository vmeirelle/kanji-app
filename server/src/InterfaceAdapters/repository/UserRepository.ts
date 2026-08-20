import { Ok, Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import { Repository } from 'typeorm'
import IUserRepository, { CreateUserData } from '../../AplicationBusiness/repository/IUserRepository'
import User from '../../EnterpriseBusiness/entities/User'
import DatabaseError from '../../EnterpriseBusiness/errors/DatabaseError'
import UserModel from './models/main/UserModel'

function toDomain(model: UserModel): User {
  return new User(model.id, model.username, model.passwordHash, model.createdAt)
}

@injectable()
export default class UserRepository implements IUserRepository {
  constructor(@inject('UserModel') private readonly model: Repository<UserModel>) {}

  async findByUsername(username: string): Promise<Result<User | null, DatabaseError>> {
    try {
      const row = await this.model.findOne({ where: { username } })
      return Ok(row ? toDomain(row) : null)
    } catch (e) {
      console.error('UserRepository.findByUsername', e)
      return Err(new DatabaseError())
    }
  }

  async findById(id: number): Promise<Result<User | null, DatabaseError>> {
    try {
      const row = await this.model.findOne({ where: { id } })
      return Ok(row ? toDomain(row) : null)
    } catch (e) {
      console.error('UserRepository.findById', e)
      return Err(new DatabaseError())
    }
  }

  async create(data: CreateUserData): Promise<Result<User, DatabaseError>> {
    try {
      const row = this.model.create({
        username: data.username,
        passwordHash: data.passwordHash,
      })
      const saved = await this.model.save(row)
      return Ok(toDomain(saved))
    } catch (e) {
      console.error('UserRepository.create', e)
      return Err(new DatabaseError())
    }
  }

  async getState(userId: number): Promise<Result<string | null, DatabaseError>> {
    try {
      const row = await this.model.findOne({ where: { id: userId }, select: { state: true } })
      return Ok(row?.state ?? null)
    } catch (e) {
      console.error('UserRepository.getState', e)
      return Err(new DatabaseError())
    }
  }

  async saveState(userId: number, state: string): Promise<Result<void, DatabaseError>> {
    try {
      await this.model.update({ id: userId }, { state })
      return Ok(undefined)
    } catch (e) {
      console.error('UserRepository.saveState', e)
      return Err(new DatabaseError())
    }
  }
}

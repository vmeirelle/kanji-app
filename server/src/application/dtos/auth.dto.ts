import type { PublicUser } from '../../domain/entities/User.js'

export type RegisterInput = {
  username: string
  password: string
}

export type LoginInput = {
  username: string
  password: string
}

export type AuthResult = {
  user: PublicUser
  token: string
}

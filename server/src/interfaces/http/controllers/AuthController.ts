import type { Context } from 'hono'
import type { RegisterUserUseCase } from '../../../application/use-cases/auth/RegisterUser.js'
import type { LoginUserUseCase } from '../../../application/use-cases/auth/LoginUser.js'
import type { GetMeUseCase } from '../../../application/use-cases/auth/GetMe.js'
import type { PublicUser } from '../../../domain/entities/User.js'
import {
  loginBodySchema,
  registerBodySchema,
  type AuthResponse,
  type UserResponse,
} from '../contracts/auth.contract.js'
import type { AppEnv } from '../types.js'

export interface AuthController {
  register(c: Context<AppEnv>): Promise<Response>
  login(c: Context<AppEnv>): Promise<Response>
  me(c: Context<AppEnv>): Promise<Response>
}

export class HttpAuthController implements AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly getMe: GetMeUseCase,
  ) {}

  async register(c: Context<AppEnv>): Promise<Response> {
    const body = registerBodySchema.parse(await c.req.json())
    const result = await this.registerUser.execute(body)
    const response: AuthResponse = { user: toUserResponse(result.user), token: result.token }
    return c.json(response, 201)
  }

  async login(c: Context<AppEnv>): Promise<Response> {
    const body = loginBodySchema.parse(await c.req.json())
    const result = await this.loginUser.execute(body)
    const response: AuthResponse = { user: toUserResponse(result.user), token: result.token }
    return c.json(response, 200)
  }

  async me(c: Context<AppEnv>): Promise<Response> {
    const user = await this.getMe.execute(c.get('userId'))
    const response: UserResponse = toUserResponse(user)
    return c.json(response, 200)
  }
}

function toUserResponse(user: PublicUser): UserResponse {
  return { id: user.id, username: user.username, createdAt: user.createdAt.toISOString() }
}

import { Ok } from 'ts-results'
import { HttpController } from './HttpController'
import { authenticate } from './authenticate'
import { Get, Post, Route } from '../../gateway/http/HttpServer'
import { HttpRequest, HttpResult, HttpStatus } from '../../gateway/http/Http.types'
import { IRegisterUserUseCase } from '../../../EnterpriseBusiness/useCases/auth/RegisterUserUseCase'
import { ILoginUserUseCase } from '../../../EnterpriseBusiness/useCases/auth/LoginUserUseCase'
import { IGetMeUseCase, PublicUser } from '../../../EnterpriseBusiness/useCases/auth/GetMeUseCase'
import ITokenService from '../../../AplicationBusiness/services/ITokenService'

interface UserResponse {
  id: number
  username: string
  createdAt: string
}

function toUserResponse(user: PublicUser): UserResponse {
  return { id: user.id, username: user.username, createdAt: user.createdAt.toISOString() }
}

@Route('/api')
export default class AuthHttpApiController extends HttpController {
  constructor(
    readonly registerUserUseCase: IRegisterUserUseCase,
    readonly loginUserUseCase: ILoginUserUseCase,
    readonly getMeUseCase: IGetMeUseCase,
    readonly tokenService: ITokenService,
  ) {
    super()
  }

  @Post('/auth/register')
  async register(req: HttpRequest): Promise<HttpResult> {
    const result = await this.registerUserUseCase.execute(
      req.body as { username: string; password: string },
    )
    if (result.err) return result
    const auth = result.unwrap()
    return Ok({
      status: HttpStatus.created,
      body: { user: toUserResponse(auth.user), token: auth.token },
    })
  }

  @Post('/auth/login')
  async login(req: HttpRequest): Promise<HttpResult> {
    const result = await this.loginUserUseCase.execute(
      req.body as { username: string; password: string },
    )
    if (result.err) return result
    const auth = result.unwrap()
    return Ok({
      status: HttpStatus.ok,
      body: { user: toUserResponse(auth.user), token: auth.token },
    })
  }

  @Get('/auth/me')
  async me(req: HttpRequest): Promise<HttpResult> {
    const auth = authenticate(req, this.tokenService)
    if (auth.err) return auth
    const result = await this.getMeUseCase.execute({ userId: auth.val })
    if (result.err) return result
    return Ok({ status: HttpStatus.ok, body: toUserResponse(result.unwrap()) })
  }
}

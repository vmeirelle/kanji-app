import { Ok } from 'ts-results'
import { HttpController } from './HttpController'
import { authenticate } from './authenticate'
import { Get, Put, Route } from '../../gateway/http/HttpServer'
import { HttpRequest, HttpResult, HttpStatus } from '../../gateway/http/Http.types'
import { IGetUserStateUseCase } from '../../../EnterpriseBusiness/useCases/state/GetUserStateUseCase'
import { ISaveUserStateUseCase } from '../../../EnterpriseBusiness/useCases/state/SaveUserStateUseCase'
import ITokenService from '../../../AplicationBusiness/services/ITokenService'

function safeParse(raw: string | null): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

@Route('/api')
export default class StateHttpApiController extends HttpController {
  constructor(
    readonly getUserStateUseCase: IGetUserStateUseCase,
    readonly saveUserStateUseCase: ISaveUserStateUseCase,
    readonly tokenService: ITokenService,
  ) {
    super()
  }

  @Get('/me/state')
  async get(req: HttpRequest): Promise<HttpResult> {
    const auth = authenticate(req, this.tokenService)
    if (auth.err) return auth
    const result = await this.getUserStateUseCase.execute({ userId: auth.val })
    if (result.err) return result
    return Ok({ status: HttpStatus.ok, body: { state: safeParse(result.val) } })
  }

  @Put('/me/state')
  async put(req: HttpRequest): Promise<HttpResult> {
    const auth = authenticate(req, this.tokenService)
    if (auth.err) return auth
    const body = req.body as { state: unknown }
    const result = await this.saveUserStateUseCase.execute({
      userId: auth.val,
      state: JSON.stringify(body.state ?? null),
    })
    if (result.err) return result
    return Ok({ status: HttpStatus.noContent })
  }
}

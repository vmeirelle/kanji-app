import { Ok } from 'ts-results'
import { HttpController } from './HttpController'
import { Get, Route } from '../../gateway/http/HttpServer'
import { HttpResult, HttpStatus } from '../../gateway/http/Http.types'

@Route('/api')
export default class HealthHttpApiController extends HttpController {
  @Get('/health')
  async health(): Promise<HttpResult> {
    return Ok({ status: HttpStatus.ok, body: { status: 'ok' } })
  }
}

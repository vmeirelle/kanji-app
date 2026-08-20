import TagError from '../../../EnterpriseBusiness/errors/TagError'
import UnknownError from '../../../EnterpriseBusiness/errors/UnknownError'
import FormError from '../../../EnterpriseBusiness/errors/form/FormError'
import NotFoundError from '../../../EnterpriseBusiness/errors/NotFoundError'
import UnauthorizedError from '../../../EnterpriseBusiness/errors/UnauthorizedError'
import LoginInvalidError from '../../../EnterpriseBusiness/errors/LoginInvalidError'
import UsernameTakenError from '../../../EnterpriseBusiness/errors/UsernameTakenError'
import TokenExpiredError from '../../../EnterpriseBusiness/errors/token/TokenExpiredError'
import TokenInvalidError from '../../../EnterpriseBusiness/errors/token/TokenInvalidError'
import { HttpMethod, HttpResponse, HttpStatus } from '../../gateway/http/Http.types'
import { HttpControllerFunction, IHttpController } from '../../gateway/http/HttpServer'

export class HttpController implements IHttpController {
  baseUrl = ''

  endpoints: { url: string; method: HttpMethod; fn: HttpControllerFunction }[] = []

  errorHandling(e: unknown): HttpResponse {
    const error = e instanceof TagError ? e : new UnknownError(String(e))
    return {
      status: this.statusFor(error),
      body: { type: error.tag, message: error.message, data: error.data },
    }
  }

  private statusFor(error: TagError): HttpStatus {
    if (error instanceof FormError) return HttpStatus.unprocessableEntity
    if (error instanceof LoginInvalidError) return HttpStatus.unauthorized
    if (error instanceof UnauthorizedError) return HttpStatus.unauthorized
    if (error instanceof TokenExpiredError) return HttpStatus.unauthorized
    if (error instanceof TokenInvalidError) return HttpStatus.unauthorized
    if (error instanceof NotFoundError) return HttpStatus.notFound
    if (error instanceof UsernameTakenError) return HttpStatus.conflict
    return HttpStatus.internalServerError
  }
}

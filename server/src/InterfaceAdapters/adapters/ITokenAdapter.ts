import { Result } from 'ts-results'
import TokenExpiredError from '../../EnterpriseBusiness/errors/token/TokenExpiredError'
import TokenInvalidError from '../../EnterpriseBusiness/errors/token/TokenInvalidError'

export interface ITokenAdapter {
  generateToken(data: object, options?: { expiresIn?: number }): string
  resolveJwt(
    token: string,
  ): Result<Record<string, unknown>, TokenExpiredError | TokenInvalidError>
}

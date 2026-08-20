import { Result } from 'ts-results'
import TokenExpiredError from '../../EnterpriseBusiness/errors/token/TokenExpiredError'
import TokenInvalidError from '../../EnterpriseBusiness/errors/token/TokenInvalidError'

export interface AccessTokenPayload {
  userId: number
}

export default interface ITokenService {
  generateAccessToken(userId: number): string
  resolveAccessToken(
    token: string,
  ): Result<AccessTokenPayload, TokenExpiredError | TokenInvalidError>
}

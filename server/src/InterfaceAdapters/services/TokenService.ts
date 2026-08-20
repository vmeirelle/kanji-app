import { Ok, Err, Result } from 'ts-results'
import { injectable, inject } from 'tsyringe'
import ITokenService, { AccessTokenPayload } from '../../AplicationBusiness/services/ITokenService'
import { ITokenAdapter } from '../adapters/ITokenAdapter'
import TokenExpiredError from '../../EnterpriseBusiness/errors/token/TokenExpiredError'
import TokenInvalidError from '../../EnterpriseBusiness/errors/token/TokenInvalidError'

@injectable()
export default class TokenService implements ITokenService {
  constructor(@inject('TokenAdapter') readonly tokenAdapter: ITokenAdapter) {}

  generateAccessToken(userId: number): string {
    return this.tokenAdapter.generateToken({ userId })
  }

  resolveAccessToken(
    token: string,
  ): Result<AccessTokenPayload, TokenExpiredError | TokenInvalidError> {
    const decoded = this.tokenAdapter.resolveJwt(token)
    if (decoded.err) return decoded
    const userId = decoded.val['userId']
    if (typeof userId !== 'number') return Err(new TokenInvalidError(token))
    return Ok({ userId })
  }
}

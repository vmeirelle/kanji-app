import jwt, { Algorithm } from 'jsonwebtoken'
import { Ok, Err, Result } from 'ts-results'
import { ITokenAdapter } from '../../InterfaceAdapters/adapters/ITokenAdapter'
import TokenExpiredError from '../../EnterpriseBusiness/errors/token/TokenExpiredError'
import TokenInvalidError from '../../EnterpriseBusiness/errors/token/TokenInvalidError'

export default class JwtAdapter implements ITokenAdapter {
  constructor(
    readonly secret: string,
    readonly algorithm: Algorithm,
    readonly expiresInSeconds: number,
  ) {}

  generateToken(data: object, options?: { expiresIn?: number }): string {
    return jwt.sign(data, this.secret, {
      algorithm: this.algorithm,
      expiresIn: options?.expiresIn ?? this.expiresInSeconds,
    })
  }

  resolveJwt(
    token: string,
  ): Result<Record<string, unknown>, TokenExpiredError | TokenInvalidError> {
    try {
      const decoded = jwt.verify(token, this.secret)
      if (typeof decoded === 'string') return Err(new TokenInvalidError(token))
      return Ok(decoded as Record<string, unknown>)
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) return Err(new TokenExpiredError(token))
      return Err(new TokenInvalidError(token))
    }
  }
}

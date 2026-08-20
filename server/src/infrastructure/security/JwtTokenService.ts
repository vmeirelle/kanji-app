import { sign, verify } from 'hono/jwt'
import type { TokenPayload, TokenService } from '../../application/ports/TokenService.js'
import { UnauthorizedError } from '../../domain/errors/DomainError.js'

type JwtConfig = {
  secret: string
  expiresInSeconds: number
}

export class JwtTokenService implements TokenService {
  constructor(private readonly config: JwtConfig) {}

  async sign(payload: TokenPayload): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    return sign(
      { userId: payload.userId, iat: now, exp: now + this.config.expiresInSeconds },
      this.config.secret,
    )
  }

  async verify(token: string): Promise<TokenPayload> {
    try {
      const decoded = await verify(token, this.config.secret)
      const userId = decoded['userId']
      if (typeof userId !== 'string') throw new UnauthorizedError('Invalid token')
      return { userId }
    } catch {
      throw new UnauthorizedError('Invalid or expired token')
    }
  }
}

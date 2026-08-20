import type { MiddlewareHandler } from 'hono'
import type { TokenService } from '../../../application/ports/TokenService.js'
import { UnauthorizedError } from '../../../domain/errors/DomainError.js'
import type { AppEnv } from '../types.js'

export function createAuthMiddleware(tokens: TokenService): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const header = c.req.header('Authorization')
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError()
    }

    const payload = await tokens.verify(header.slice('Bearer '.length))
    c.set('userId', payload.userId)
    await next()
  }
}

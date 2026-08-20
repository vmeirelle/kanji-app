import { Ok, Err, Result } from 'ts-results'
import ITokenService from '../../../AplicationBusiness/services/ITokenService'
import UnauthorizedError from '../../../EnterpriseBusiness/errors/UnauthorizedError'
import { HttpRequest } from '../../gateway/http/Http.types'

export function authenticate(
  req: HttpRequest,
  tokenService: ITokenService,
): Result<number, UnauthorizedError> {
  const header = req.headers['authorization']
  if (!header || !header.startsWith('Bearer ')) return Err(new UnauthorizedError())

  const resolved = tokenService.resolveAccessToken(header.slice('Bearer '.length))
  if (resolved.err) return Err(new UnauthorizedError())

  return Ok(resolved.val.userId)
}

import type { Context } from 'hono'
import { ZodError } from 'zod'
import { DomainError } from '../../../domain/errors/DomainError.js'

const STATUS_BY_CODE: Record<string, number> = {
  USERNAME_TAKEN: 409,
  INVALID_CREDENTIALS: 401,
  UNAUTHORIZED: 401,
  USER_NOT_FOUND: 404,
}

type ErrorBody = {
  error: {
    code: string
    message: string
  }
}

export function handleError(err: Error, c: Context): Response {
  if (err instanceof ZodError) {
    const body: ErrorBody = {
      error: { code: 'VALIDATION_ERROR', message: err.issues.map((i) => i.message).join('; ') },
    }
    return c.json(body, 400)
  }

  if (err instanceof DomainError) {
    const status = STATUS_BY_CODE[err.code] ?? 400
    const body: ErrorBody = { error: { code: err.code, message: err.message } }
    return c.json(body, status as 400 | 401 | 404 | 409)
  }

  const body: ErrorBody = { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }
  return c.json(body, 500)
}

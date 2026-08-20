import TagError, { ErrorTag } from '../TagError'

export default class TokenExpiredError extends TagError<string> {
  tag: ErrorTag = 'TOKEN_EXPIRED_ERROR'

  constructor(token: string) {
    super('Token expired')
    this.data = token
  }
}

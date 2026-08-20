import TagError, { ErrorTag } from '../TagError'

export default class TokenInvalidError extends TagError<string> {
  tag: ErrorTag = 'TOKEN_INVALID_ERROR'

  constructor(token: string) {
    super('Token invalid')
    this.data = token
  }
}

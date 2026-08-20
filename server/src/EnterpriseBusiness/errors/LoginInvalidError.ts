import TagError, { ErrorTag } from './TagError'

export default class LoginInvalidError extends TagError<string> {
  tag: ErrorTag = 'LOGIN_INVALID_ERROR'

  constructor(username: string) {
    super('Invalid username or password')
    this.data = username
  }
}

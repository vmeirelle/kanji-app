import TagError, { ErrorTag } from './TagError'

export default class UsernameTakenError extends TagError<string> {
  tag: ErrorTag = 'USERNAME_TAKEN_ERROR'

  constructor(username: string) {
    super(`Username "${username}" is already taken`)
    this.data = username
  }
}

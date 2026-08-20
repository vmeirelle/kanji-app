import TagError, { ErrorTag } from './TagError'

export default class NotFoundError extends TagError<string> {
  tag: ErrorTag = 'NOT_FOUND_ERROR'

  constructor(whatIsNotFound: string) {
    super(`${whatIsNotFound} Not Found`)
    this.data = whatIsNotFound
  }
}

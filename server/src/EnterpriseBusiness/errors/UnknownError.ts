import TagError, { ErrorTag } from './TagError'

export default class UnknownError extends TagError<string> {
  tag: ErrorTag = 'UNKNOWN_ERROR'

  constructor(detail: string) {
    super(detail)
    this.data = detail
  }
}

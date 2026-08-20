import TagError, { ErrorTag } from './TagError'

export default class UnauthorizedError extends TagError {
  tag: ErrorTag = 'UNAUTHORIZED_ERROR'

  constructor(message = 'Authentication required') {
    super(message)
  }
}

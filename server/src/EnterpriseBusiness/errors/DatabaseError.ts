import TagError, { ErrorTag } from './TagError'

export default class DatabaseError extends TagError {
  tag: ErrorTag = 'DATABASE_ERROR'

  constructor() {
    super('Database Error')
  }
}

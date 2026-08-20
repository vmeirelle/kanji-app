export type ErrorTag =
  | 'FORM_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR'
  | 'UNAUTHORIZED_ERROR'
  | 'LOGIN_INVALID_ERROR'
  | 'USERNAME_TAKEN_ERROR'
  | 'TOKEN_EXPIRED_ERROR'
  | 'TOKEN_INVALID_ERROR'

export default abstract class TagError<T = unknown> extends Error {
  abstract tag: ErrorTag
  data?: T
}

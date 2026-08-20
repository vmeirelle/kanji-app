export abstract class DomainError extends Error {
  abstract readonly code: string
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class UsernameTakenError extends DomainError {
  readonly code = 'USERNAME_TAKEN'
  constructor(username: string) {
    super(`Username "${username}" is already taken`)
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS'
  constructor() {
    super('Invalid username or password')
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED'
  constructor(message = 'Authentication required') {
    super(message)
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND'
  constructor() {
    super('User not found')
  }
}

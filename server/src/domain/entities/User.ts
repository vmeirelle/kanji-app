export type PublicUser = {
  id: string
  username: string
  createdAt: Date
}

export class User {
  constructor(
    readonly id: string,
    readonly username: string,
    readonly passwordHash: string,
    readonly createdAt: Date,
  ) {}

  toPublic(): PublicUser {
    return { id: this.id, username: this.username, createdAt: this.createdAt }
  }
}

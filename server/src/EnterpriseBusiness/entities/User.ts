import { Entity } from './Entity'

export default class User extends Entity {
  constructor(
    id: number,
    readonly username: string,
    readonly passwordHash: string,
    readonly createdAt: Date,
  ) {
    super(id)
  }
}

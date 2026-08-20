import { Entity } from './Entity'

export default class Ranking extends Entity {
  constructor(
    id: number,
    readonly userId: number,
    readonly level: string,
    readonly correct: number,
    readonly total: number,
    readonly points: number,
    readonly day: string,
    readonly date: Date,
  ) {
    super(id)
  }
}

export interface RankingWithUser {
  id: number
  username: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: Date
}

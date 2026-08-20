export class Ranking {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly level: string,
    readonly correct: number,
    readonly total: number,
    readonly points: number,
    readonly day: string,
    readonly date: Date,
  ) {}
}

export type RankingWithUser = {
  id: string
  username: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: Date
}

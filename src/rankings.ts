import * as storage from './storage'

export type Ranking = {
  name: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: string
}

const KEY = 'kanji-rankings.v3'

export const points = (r: Ranking): number => r.points

export const loadRankings = (): Ranking[] => storage.load<Ranking[]>(KEY) ?? []

export function addRanking(entry: Ranking): Ranking[] {
  const all = [...loadRankings(), entry].sort((a, b) => points(b) - points(a))
  storage.save(KEY, all)
  return all
}

export const today = (): string => new Date().toLocaleDateString('en-CA')

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y!, m! - 1, d! + n).toLocaleDateString('en-CA')
}

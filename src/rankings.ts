import * as storage from './storage'

export type Ranking = {
  name: string
  blockId: string
  blockName: string
  correct: number
  total: number
  day: string
  date: string
}

const KEY = 'kanji-rankings.v2'

export const pointsOf = (correct: number, total: number): number =>
  total ? Math.round(((correct * correct) / total) * 10) : 0

export const points = (r: Ranking): number => pointsOf(r.correct, r.total)

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

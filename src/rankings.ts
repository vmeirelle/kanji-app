import * as storage from './storage'

export type Ranking = {
  name: string
  blockId: string
  blockName: string
  correct: number // first-try correct answers
  total: number // questions in the (first) pass
  day: string // local calendar day, YYYY-MM-DD (leaderboards are per block + day)
  date: string // full ISO timestamp
}

const KEY = 'kanji-rankings.v2'

/**
 * Points reward both accuracy and volume: correct² / total, i.e. correct × the
 * hit rate. Same accuracy → more questions scores higher (9/9 beats 3/3), and
 * more correct always beats fewer. Scaled ×10 for a readable spread.
 */
export const pointsOf = (correct: number, total: number): number =>
  total ? Math.round(((correct * correct) / total) * 10) : 0

export const points = (r: Ranking): number => pointsOf(r.correct, r.total)

export const loadRankings = (): Ranking[] => storage.load<Ranking[]>(KEY) ?? []

/** Append a score and return the full list, sorted best-first by points. */
export function addRanking(entry: Ranking): Ranking[] {
  const all = [...loadRankings(), entry].sort((a, b) => points(b) - points(a))
  storage.save(KEY, all)
  return all
}

/** Local calendar day as YYYY-MM-DD (en-CA formats that way). */
export const today = (): string => new Date().toLocaleDateString('en-CA')

/** Shift a YYYY-MM-DD day by n calendar days. */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y!, m! - 1, d! + n).toLocaleDateString('en-CA')
}

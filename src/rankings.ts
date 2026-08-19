import * as storage from './storage'

export type Ranking = {
  name: string
  blockId: string
  blockName: string
  pct: number // first-try accuracy, 0–100
  date: string // ISO
}

const KEY = 'kanji-rankings.v1'

export const loadRankings = (): Ranking[] => storage.load<Ranking[]>(KEY) ?? []

/** Append a score and return the full list, sorted best-first. */
export function addRanking(entry: Ranking): Ranking[] {
  const all = [...loadRankings(), entry].sort((a, b) => b.pct - a.pct)
  storage.save(KEY, all)
  return all
}

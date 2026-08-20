export type Ranking = {
  name: string
  level: string
  correct: number
  total: number
  points: number
  day: string
  date: string
}

export const points = (r: Ranking): number => r.points

export const today = (): string => new Date().toLocaleDateString('en-CA')

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y!, m! - 1, d! + n).toLocaleDateString('en-CA')
}

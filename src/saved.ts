import * as storage from './storage'

export type Round = {
  levels: string[]
  selected: string[]
  size: number
  queue: string[]
  passTotal: number
  incorrect: string[]
  correct: number
  wrong: number
  firstCorrect: number
  firstTotal: number
  scored: boolean
  hasRetried: boolean
}

export type SavedLesson = Round & {
  id: string
  label: string
  date: string
}

const KEY = 'kanji-saved.v1'

export const loadSaved = (): SavedLesson[] => storage.load<SavedLesson[]>(KEY) ?? []

export function putSaved(list: SavedLesson[], lesson: SavedLesson): SavedLesson[] {
  const next = [lesson, ...list.filter((x) => x.id !== lesson.id)]
  storage.save(KEY, next)
  return next
}

export function dropSaved(list: SavedLesson[], id: string): SavedLesson[] {
  const next = list.filter((x) => x.id !== id)
  storage.save(KEY, next)
  return next
}

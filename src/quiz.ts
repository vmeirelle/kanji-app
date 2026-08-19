import type { Kanji } from './data/blocks'

/** A renderable facet of a kanji — extend by adding a key to `Kanji`. */
export type Format = keyof Kanji

/** A quiz mode maps the prompt facet to the answer facet. Add modes freely. */
export type Mode = { id: string; label: string; prompt: Format; answer: Format }

/** The facets the user can toggle From/To. Add a row to expose a new facet. */
export const FORMATS: { id: Format; label: string }[] = [
  { id: 'char', label: 'Kanji' },
  { id: 'kana', label: 'Kana' },
  { id: 'meaning', label: 'English' },
]

/** Build a mode from a chosen prompt + answer facet. */
export const modeOf = (prompt: Format, answer: Format): Mode => ({
  id: `${prompt}-${answer}`,
  label: `${prompt}→${answer}`,
  prompt,
  answer,
})

export type Option = { key: string; label: string; correct: boolean }
export type Question = { prompt: string; options: Option[] }

export function shuffle<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a
}

/**
 * Build one question: the prompt rendered in `mode.prompt`, and up to `count`
 * answer squares rendered in `mode.answer`. Distractors are drawn from `pool`
 * and deduped by their answer label, so no two squares ever read the same.
 */
export function buildQuestion(
  target: Kanji,
  pool: Kanji[],
  mode: Mode,
  count = 9,
): Question {
  const label = (k: Kanji) => k[mode.answer]
  const seen = new Set([label(target)])
  const distractors: Kanji[] = []
  for (const k of shuffle(pool)) {
    if (distractors.length >= count - 1) break
    if (seen.has(label(k))) continue
    seen.add(label(k))
    distractors.push(k)
  }
  const options = shuffle([target, ...distractors]).map((k) => ({
    key: k.char,
    label: label(k),
    correct: k === target,
  }))
  return { prompt: target[mode.prompt], options }
}

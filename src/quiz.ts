import type { Kanji } from './data/blocks'

export type Format = keyof Kanji

export type Mode = { id: string; label: string; prompt: Format; answer: Format }

export const FORMATS: { id: Format; label: string }[] = [
  { id: 'char', label: 'Kanji' },
  { id: 'kana', label: 'Kana' },
  { id: 'meaning', label: 'English' },
]

export const modeOf = (prompt: Format, answer: Format): Mode => ({
  id: `${prompt}-${answer}`,
  label: `${prompt}→${answer}`,
  prompt,
  answer,
})

export type Facets = { char: string; kana: string; meaning: string }
export type Option = { key: string; label: string; correct: boolean; facets: Facets }
export type Question = { prompt: string; target: Facets; options: Option[] }

const facetsOf = (k: Kanji): Facets => ({ char: k.char, kana: k.kana, meaning: k.meaning })

export type Script = 'kanji' | 'kana' | 'latin'
export const scriptOf = (s: string): Script => {
  if (/[一-鿿]/.test(s)) return 'kanji'
  if (/[぀-ヿ]/.test(s)) return 'kana'
  return 'latin'
}
export const isJapanese = (s: string): boolean => scriptOf(s) !== 'latin'

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
    facets: facetsOf(k),
  }))
  return { prompt: target[mode.prompt], target: facetsOf(target), options }
}

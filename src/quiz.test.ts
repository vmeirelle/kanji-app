import { describe, it, expect } from 'vitest'
import { FORMATS, modeOf, buildQuestion } from './quiz'
import blocks from './data/blocks.json'
import type { Block, Kanji } from './data/blocks'

const pool: Kanji[] = Array.from({ length: 12 }, (_, i) => ({
  char: `c${i}`,
  meaning: `m${i}`,
  kana: `k${i}`,
}))
const meaningMode = modeOf('char', 'meaning')
const kanaMode = modeOf('char', 'kana')

describe('buildQuestion', () => {
  it('renders prompt and options in the mode formats', () => {
    const q = buildQuestion(pool[0]!, pool, meaningMode)
    expect(q.prompt).toBe('c0') // prompt = char
    const correct = q.options.find((o) => o.correct)!
    expect(correct.label).toBe('m0') // answer = meaning
  })

  it('returns `count` options with exactly one correct', () => {
    const q = buildQuestion(pool[0]!, pool, kanaMode, 9)
    expect(q.options).toHaveLength(9)
    expect(q.options.filter((o) => o.correct)).toHaveLength(1)
  })

  it('never repeats an answer label', () => {
    const q = buildQuestion(pool[0]!, pool, meaningMode, 9)
    const labels = q.options.map((o) => o.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('caps at the pool size when it is smaller than count', () => {
    const small = pool.slice(0, 4)
    const q = buildQuestion(small[0]!, small, kanaMode, 9)
    expect(q.options).toHaveLength(4)
    expect(new Set(q.options.map((o) => o.label)).size).toBe(4)
  })
})

describe('seed data yields 9 options for every kanji and answer format', () => {
  for (const block of blocks as Block[]) {
    for (const fmt of FORMATS) {
      it(`${block.name} / To=${fmt.label}`, () => {
        const mode = modeOf('char', fmt.id)
        for (const target of block.kanji) {
          const q = buildQuestion(target, block.kanji, mode, 9)
          expect(q.options).toHaveLength(9) // no duplicate labels collapsing a square
        }
      })
    }
  }
})

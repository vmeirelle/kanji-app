import { describe, it, expect } from 'vitest'
import { useQuiz } from './useQuiz'
import { FORMATS, modeOf, buildQuestion } from './quiz'
import blocks from './data/blocks.json'
import { blocksIn, levelsOf, poolOf, type Block, type Kanji } from './data/blocks'

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

describe('category selection', () => {
  const all = blocks as Block[]

  it('lists each level once, easiest first, covering every block', () => {
    const levels = levelsOf(all)
    expect(levels[0]).toBe('N5')
    expect(new Set(levels).size).toBe(levels.length)
    expect(blocksIn(all, levels)).toHaveLength(all.length)
  })

  it('mixes categories across the checked levels only', () => {
    const n5 = blocksIn(all, ['N5'])
    expect(n5.length).toBeGreaterThan(1)
    expect(n5.every((b) => b.level === 'N5')).toBe(true)
    // Two levels checked = both levels on offer, nothing else.
    const mixed = blocksIn(all, ['N5', 'N4'])
    expect(mixed.length).toBe(n5.length + blocksIn(all, ['N4']).length)
    expect(blocksIn(all, [])).toHaveLength(0)
    expect(blocksIn(all, ['N9'])).toHaveLength(0) // unknown level offers nothing
  })

  it('pools only the selected categories', () => {
    const [a, b] = all
    const pool = poolOf(all, [a!.id, b!.id])
    expect(pool).toHaveLength(a!.kanji.length + b!.kanji.length)
    expect(poolOf(all, [])).toHaveLength(0)
    expect(poolOf(all, ['nope'])).toHaveLength(0)
  })

  it('builds 9 distinct options from a multi-category pool', () => {
    const pool = poolOf(all, all.map((b) => b.id))
    for (const fmt of FORMATS) {
      const q = buildQuestion(pool[0]!, pool, modeOf('char', fmt.id), 9)
      expect(new Set(q.options.map((o) => o.label)).size).toBe(9)
    }
  })
})

describe('useQuiz levels', () => {
  it('keeps at least one level checked', async () => {
    const q = useQuiz()
    await q.start()
    expect(q.chosenLevels.value).toEqual(['N5'])
    q.toggleLevel('N5') // the only one on — refused
    expect(q.chosenLevels.value).toEqual(['N5'])
    expect(q.isOnlyLevel('N5')).toBe(true)
    q.toggleLevel('N4') // mixing in a second level is fine
    expect(q.chosenLevels.value).toEqual(['N5', 'N4'])
    expect(q.isOnlyLevel('N5')).toBe(false)
    q.toggleLevel('N5') // now N5 can go, N4 holds the floor
    expect(q.chosenLevels.value).toEqual(['N4'])
    expect(q.levelBlocks.value.every((b) => b.level === 'N4')).toBe(true)
    expect(q.poolSize.value).toBeGreaterThan(0)
  })
})

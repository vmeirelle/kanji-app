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

describe('seed data yields full, non-repeating options for every kanji and answer format', () => {
  for (const block of blocks as Block[]) {
    for (const fmt of FORMATS) {
      it(`${block.name} / To=${fmt.label}`, () => {
        const mode = modeOf('char', fmt.id)
        for (const target of block.kanji) {
          const q = buildQuestion(target, block.kanji, mode, 9)
          // Every square is distinct — no duplicate labels collapsing a square.
          const labels = q.options.map((o) => o.label)
          expect(new Set(labels).size).toBe(labels.length)
          // The grid fills to 9, or to however many distinct answers the block
          // can offer when a themed category is smaller than the grid.
          const distinct = new Set(block.kanji.map((k) => k[fmt.id])).size
          expect(q.options).toHaveLength(Math.min(9, distinct))
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

describe('useQuiz saved lessons', () => {
  it('sets an unfinished round aside and picks it back up', async () => {
    const q = useQuiz()
    await q.start()
    q.size.value = 10
    q.startPass()
    q.answer(q.question.value!.options[0]!.key)
    q.next() // one question down, nine to go
    const left = q.queueChars.value.length
    expect(left).toBe(9)

    q.restart() // Stop
    expect(q.phase.value).toBe('ready')
    expect(q.savedLessons.value).toHaveLength(1)
    const lesson = q.savedLessons.value[0]!
    expect(lesson.queue).toHaveLength(9)
    expect(lesson.passTotal).toBe(10)
    expect(lesson.label).toBe(q.selectionName.value)

    q.resume(lesson.id)
    expect(q.phase.value).toBe('question')
    expect(q.queueChars.value).toHaveLength(9)
    expect(q.passTotal.value).toBe(10)
    expect(q.position.value).toBe(2) // back on question 2 of 10
    expect(q.savedLessons.value).toHaveLength(0) // it is live again, not paused

    // A round played to the end has nothing to set aside.
    while (q.phase.value === 'question') {
      q.answer(q.question.value!.options[0]!.key)
      q.next()
    }
    expect(q.phase.value).toBe('done')
    q.restart() // Finish
    expect(q.savedLessons.value).toHaveLength(0)
  })

  it('deletes a paused lesson on request', async () => {
    const q = useQuiz()
    await q.start()
    q.startPass()
    q.restart()
    const id = q.savedLessons.value[0]!.id
    q.drop(id)
    expect(q.savedLessons.value).toHaveLength(0)
  })
})

describe('useQuiz levels', () => {
  it('runs exactly one level at a time', async () => {
    const q = useQuiz()
    await q.start()
    expect(q.level.value).toBe('N5')

    q.setLevel('N4')
    expect(q.level.value).toBe('N4')
    expect(q.chosenLevels.value).toHaveLength(1) // never two at once
    expect(q.levelBlocks.value.every((b) => b.level === 'N4')).toBe(true)
    expect(q.poolSize.value).toBeGreaterThan(0)

    // Re-tapping the active level leaves the category picks alone.
    q.selected.value = [q.levelBlocks.value[0]!.id]
    q.setLevel('N4')
    expect(q.selected.value).toHaveLength(1)
  })

  it('samples a round of the requested size at random from the pool', async () => {
    const q = useQuiz()
    await q.start()
    const chars = new Set(q.levelBlocks.value.flatMap((b) => b.kanji.map((k) => k.char)))

    q.size.value = q.poolSize.value // the whole pool
    q.startPass()
    expect(q.passTotal.value).toBe(q.poolSize.value)

    q.size.value = 5
    q.startPass()
    expect(q.passTotal.value).toBe(5)
    expect(new Set(q.queueChars.value).size).toBe(5) // no kanji asked twice
    expect(q.queueChars.value.every((c) => chars.has(c))).toBe(true)

    // Every offered size is one the pool can fill, and the pool is never exceeded.
    expect(q.sizeOptions.value.every((n) => n <= q.poolSize.value)).toBe(true)

    // Asking for more than the pool holds just asks everything once.
    q.size.value = 999
    q.startPass()
    expect(q.passTotal.value).toBe(q.poolSize.value)
  })
})

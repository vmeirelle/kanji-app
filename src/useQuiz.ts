import { ref, computed, watch } from 'vue'
import { blocksIn, levelsOf, loadBlocks, poolOf, type Block } from './data/blocks'
import { modeOf, buildQuestion, shuffle, type Format, type Question } from './quiz'
import * as storage from './storage'
import { dropSaved, loadSaved, putSaved, type Round, type SavedLesson } from './saved'

type Phase = 'ready' | 'question' | 'done'

/** The minimal, JSON-serializable slice we persist to localStorage. */
type Persisted = Round & { from: Format; to: Format }

const KEY = 'kanji-quiz-state.v7'
const SIZES = [5, 10, 20, 30] // round sizes offered; 0 means the whole pool
const REVEAL_MS = 600 // how long the correct/wrong colors stay lit
const CLEAR_MS = 220 // neutral gap while the colors fade, before the next kanji

export function useQuiz() {
  const blocks = ref<Block[]>([])
  const phase = ref<Phase>('ready')
  const chosenLevels = ref<string[]>([]) // JLPT levels in play — mixable; persisted
  const selected = ref<string[]>([]) // category ids the user opted into; persisted
  const size = ref(0) // kanji per round, sampled at random; 0 = every one; persisted
  const savedLessons = ref<SavedLesson[]>([]) // rounds set aside, newest first
  const roundId = ref('') // identifies the running round when it is saved
  const queue = ref<string[]>([]) // kanji chars left in this pass; [0] is current
  const passTotal = ref(0) // size of the current pass, for the x/total display
  const incorrect = ref<string[]>([]) // chars answered wrong this pass
  const correct = ref(0) // tally for the current pass
  const wrong = ref(0) // tally for the current pass

  // First-try result — captured once, when the first pass ends. This is what
  // the ranking records; retrying incorrect answers never changes it.
  const firstCorrect = ref(0)
  const firstTotal = ref(0)
  const scored = ref(false)
  const hasRetried = ref(false)

  const from = ref<Format>('char') // prompt facet (user-toggled)
  const to = ref<Format>('meaning') // answer facet (user-toggled)

  const question = ref<Question | null>(null)
  const chosenKey = ref<string | null>(null) // the square the user tapped (null until answered)
  const answered = computed(() => chosenKey.value !== null)

  const levels = computed(() => levelsOf(blocks.value)) // every level in the data
  /** The categories on offer: those of every checked level. */
  const levelBlocks = computed(() => blocksIn(blocks.value, chosenLevels.value))

  /** True for the one remaining checked level — its checkbox is locked on. */
  const isOnlyLevel = (l: string) =>
    chosenLevels.value.length === 1 && chosenLevels.value[0] === l

  /** Check/uncheck a level, taking or dropping its categories with it. */
  function toggleLevel(l: string) {
    const on = chosenLevels.value.includes(l)
    if (on && chosenLevels.value.length === 1) return // at least one level stays on
    const ids = blocksIn(blocks.value, [l]).map((b) => b.id)
    chosenLevels.value = on
      ? chosenLevels.value.filter((x) => x !== l)
      : [...chosenLevels.value, l]
    selected.value = on
      ? selected.value.filter((id) => !ids.includes(id))
      : [...new Set([...selected.value, ...ids])]
  }

  // Every selected category pooled together: the pass, and the distractors.
  const pool = computed(() => poolOf(blocks.value, selected.value))
  const poolSize = computed(() => pool.value.length)
  /** Only offer sizes the pool can actually fill, plus "All". */
  const queueChars = computed(() => queue.value) // what is left to ask, in order
  /** Only offer sizes the pool can actually fill, plus "All". */
  const sizeOptions = computed(() => [...SIZES.filter((n) => n < poolSize.value), 0])
  /** Questions the next round will ask. */
  const roundSize = computed(() =>
    size.value ? Math.min(size.value, poolSize.value) : poolSize.value,
  )
  const byChar = (c: string) => pool.value.find((k) => k.char === c) ?? null
  const chosenBlocks = computed(() => blocks.value.filter((b) => selected.value.includes(b.id)))
  /** Short label for the header and the ranking row. */
  const selectionName = computed(() => {
    const names = chosenBlocks.value.map((b) => `${b.level} ${b.name}`)
    return names.length > 2 ? `${names[0]} +${names.length - 1}` : names.join(' · ')
  })
  const selectionId = computed(() => [...selected.value].sort().join('+'))
  // Question number within the current pass, e.g. 3 of 9.
  const position = computed(() => passTotal.value - queue.value.length + 1)
  const incorrectCount = computed(() => incorrect.value.length)
  // First-try accuracy as a whole-number percentage.
  const pct = computed(() =>
    firstTotal.value ? Math.round((firstCorrect.value / firstTotal.value) * 100) : 0,
  )
  // Retry is offered only after the first try, and only once.
  const canRetry = computed(() => incorrectCount.value > 0 && !hasRetried.value)

  /** The round as plain data. */
  const roundOf = (): Round => ({
    levels: chosenLevels.value,
    selected: selected.value,
    size: size.value,
    queue: queue.value,
    passTotal: passTotal.value,
    incorrect: incorrect.value,
    correct: correct.value,
    wrong: wrong.value,
    firstCorrect: firstCorrect.value,
    firstTotal: firstTotal.value,
    scored: scored.value,
    hasRetried: hasRetried.value,
  })

  /** Load a round back into state. Levels and categories come with it. */
  function applyRound(r: Round) {
    chosenLevels.value = r.levels
    selected.value = r.selected
    size.value = r.size ?? 0
    queue.value = r.queue
    passTotal.value = r.passTotal || r.queue.length
    incorrect.value = r.incorrect ?? []
    correct.value = r.correct ?? 0
    wrong.value = r.wrong ?? 0
    firstCorrect.value = r.firstCorrect ?? 0
    firstTotal.value = r.firstTotal ?? 0
    scored.value = r.scored ?? false
    hasRetried.value = r.hasRetried ?? false
  }

  /** Build a question for the head of the queue using the current From/To. */
  function newQuestion() {
    const target = queue.value[0] ? byChar(queue.value[0]) : null
    if (!target) return
    question.value = buildQuestion(target, pool.value, modeOf(from.value, to.value))
    chosenKey.value = null
  }

  async function start() {
    blocks.value = await loadBlocks()
    savedLessons.value = loadSaved()
    const saved = storage.load<Persisted>(KEY)
    // Level and categories are config: remembered across sessions, so no re-picking.
    chosenLevels.value = (saved?.levels ?? []).filter((l) => levels.value.includes(l))
    if (!chosenLevels.value.length) chosenLevels.value = levels.value.slice(0, 1)
    selected.value = (saved?.selected ?? []).filter((id) =>
      levelBlocks.value.some((b) => b.id === id),
    )
    size.value = saved?.size ?? 0
    if (!saved) {
      selected.value = levelBlocks.value.map((b) => b.id)
      return
    }
    from.value = saved.from ?? 'char'
    to.value = saved.to ?? 'meaning'
    // Only resume a pass whose kanji are all still in the selected pool.
    const q = (saved.queue ?? []).filter((c) => pool.value.some((k) => k.char === c))
    if (!q.length || q.length !== saved.queue?.length) return
    applyRound(saved)
    newQuestion()
    phase.value = 'question'
  }

  /** Pick up a lesson that was set aside. It leaves the saved list. */
  function resume(id: string) {
    const lesson = savedLessons.value.find((l) => l.id === id)
    if (!lesson) return
    savedLessons.value = dropSaved(savedLessons.value, id)
    applyRound(lesson)
    // Drop any kanji the data no longer has, so the round stays answerable.
    queue.value = lesson.queue.filter((c) => pool.value.some((k) => k.char === c))
    if (!queue.value.length) return
    roundId.value = lesson.id
    newQuestion()
    phase.value = 'question'
  }

  function drop(id: string) {
    savedLessons.value = dropSaved(savedLessons.value, id)
  }

  /** Begin a fresh pass: a random sample of the selected categories. */
  function startPass() {
    if (!poolSize.value) return
    roundId.value = String(Date.now())
    queue.value = shuffle(pool.value.map((k) => k.char)).slice(0, roundSize.value)
    passTotal.value = queue.value.length
    incorrect.value = []
    correct.value = 0
    wrong.value = 0
    firstCorrect.value = 0
    firstTotal.value = 0
    scored.value = false
    hasRetried.value = false
    newQuestion()
    phase.value = 'question'
  }

  function answer(key: string) {
    if (answered.value || !question.value) return // one answer per question
    chosenKey.value = key
    const picked = question.value.options.find((o) => o.key === key)
    const char = queue.value[0]
    if (picked?.correct) {
      correct.value++
    } else {
      wrong.value++
      if (char && !incorrect.value.includes(char)) incorrect.value.push(char)
    }
    // No auto-advance: the reveal stays until the user taps to continue (next()).
  }

  /** Advance to the next kanji — triggered by the user tapping after a reveal. */
  function next() {
    if (answered.value) advance()
  }

  function advance() {
    queue.value.shift()
    if (queue.value.length) {
      newQuestion()
    } else {
      // End of the pass. Lock in the first-try score the first time we finish.
      if (!scored.value) {
        firstCorrect.value = correct.value
        firstTotal.value = passTotal.value
        scored.value = true
      }
      question.value = null
      chosenKey.value = null
      phase.value = 'done'
    }
  }

  /** Start a fresh pass over just the kanji missed in the pass that ended. */
  function retryIncorrect() {
    hasRetried.value = true
    queue.value = incorrect.value
    passTotal.value = queue.value.length
    incorrect.value = []
    correct.value = 0
    wrong.value = 0
    newQuestion()
    phase.value = 'question'
  }

  /**
   * Back to the category list. An unfinished round is set aside first, so every
   * exit path (Stop, the logo, anything later) resumes instead of losing work.
   */
  function restart() {
    if (queue.value.length) {
      savedLessons.value = putSaved(savedLessons.value, {
        ...roundOf(),
        id: roundId.value || String(Date.now()),
        label: selectionName.value,
        date: new Date().toISOString(),
      })
    }
    queue.value = []
    passTotal.value = 0
    incorrect.value = []
    correct.value = 0
    wrong.value = 0
    firstCorrect.value = 0
    firstTotal.value = 0
    scored.value = false
    hasRetried.value = false
    question.value = null
    chosenKey.value = null
    phase.value = 'ready'
  }

  // Rebuild the current question when the user toggles From/To mid-quiz.
  watch([from, to], () => {
    if (phase.value === 'question') newQuestion()
  })

  // Persist selection + pass progress whenever either changes.
  watch(
    [chosenLevels, selected, size, queue, passTotal, incorrect, correct, wrong, from, to, scored, hasRetried],
    () => {
      storage.save<Persisted>(KEY, { ...roundOf(), from: from.value, to: to.value })
    },
    { deep: true },
  )

  return {
    blocks,
    phase,
    levels,
    chosenLevels,
    toggleLevel,
    isOnlyLevel,
    levelBlocks,
    selected,
    poolSize,
    size,
    sizeOptions,
    queueChars,
    roundSize,
    savedLessons,
    resume,
    drop,
    selectionName,
    selectionId,
    question,
    chosenKey,
    answered,
    position,
    passTotal,
    correct,
    wrong,
    incorrectCount,
    canRetry,
    pct,
    firstCorrect,
    firstTotal,
    from,
    to,
    start,
    startPass,
    answer,
    next,
    retryIncorrect,
    restart,
  }
}

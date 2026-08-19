import { ref, computed, watch } from 'vue'
import { loadBlocks, poolOf, type Block } from './data/blocks'
import { modeOf, buildQuestion, shuffle, type Format, type Question } from './quiz'
import * as storage from './storage'

type Phase = 'ready' | 'question' | 'done'

/** The minimal, JSON-serializable slice we persist to localStorage. */
type Persisted = {
  selected: string[]
  queue: string[]
  passTotal: number
  incorrect: string[]
  correct: number
  wrong: number
  from: Format
  to: Format
  firstCorrect: number
  firstTotal: number
  scored: boolean
  hasRetried: boolean
}

const KEY = 'kanji-quiz-state.v4'
const REVEAL_MS = 600 // how long the correct/wrong colors stay lit
const CLEAR_MS = 220 // neutral gap while the colors fade, before the next kanji

export function useQuiz() {
  const blocks = ref<Block[]>([])
  const phase = ref<Phase>('ready')
  const selected = ref<string[]>([]) // category ids the user opted into; persisted
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
  const chosenKey = ref<string | null>(null) // the square the user tapped (drives colors)
  const locked = ref(false) // block taps through the reveal + fade, until next kanji

  // Every selected category pooled together: the pass, and the distractors.
  const pool = computed(() => poolOf(blocks.value, selected.value))
  const poolSize = computed(() => pool.value.length)
  const byChar = (c: string) => pool.value.find((k) => k.char === c) ?? null
  const chosenBlocks = computed(() => blocks.value.filter((b) => selected.value.includes(b.id)))
  /** Short label for the header and the ranking row. */
  const selectionName = computed(() => {
    const names = chosenBlocks.value.map((b) => b.name)
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

  /** Build a question for the head of the queue using the current From/To. */
  function newQuestion() {
    const target = queue.value[0] ? byChar(queue.value[0]) : null
    if (!target) return
    question.value = buildQuestion(target, pool.value, modeOf(from.value, to.value))
    chosenKey.value = null
  }

  async function start() {
    blocks.value = await loadBlocks()
    const saved = storage.load<Persisted>(KEY)
    // Categories are config: remembered across sessions, so no re-picking.
    selected.value = (saved?.selected ?? []).filter((id) =>
      blocks.value.some((b) => b.id === id),
    )
    if (!saved) {
      selected.value = blocks.value.filter((b) => b.level === 'N5').map((b) => b.id)
      return
    }
    from.value = saved.from ?? 'char'
    to.value = saved.to ?? 'meaning'
    // Only resume a pass whose kanji are all still in the selected pool.
    const q = (saved.queue ?? []).filter((c) => pool.value.some((k) => k.char === c))
    if (!q.length || q.length !== saved.queue?.length) return
    queue.value = q
    passTotal.value = saved.passTotal || q.length
    incorrect.value = saved.incorrect ?? []
    correct.value = saved.correct ?? 0
    wrong.value = saved.wrong ?? 0
    firstCorrect.value = saved.firstCorrect ?? 0
    firstTotal.value = saved.firstTotal ?? 0
    scored.value = saved.scored ?? false
    hasRetried.value = saved.hasRetried ?? false
    newQuestion()
    phase.value = 'question'
  }

  /** Begin a fresh pass over every kanji in the selected categories. */
  function startPass() {
    if (!poolSize.value) return
    queue.value = shuffle(pool.value.map((k) => k.char))
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
    if (locked.value || !question.value) return // ignore taps during the reveal
    locked.value = true
    chosenKey.value = key
    const picked = question.value.options.find((o) => o.key === key)
    const char = queue.value[0]
    if (picked?.correct) {
      correct.value++
    } else {
      wrong.value++
      if (char && !incorrect.value.includes(char)) incorrect.value.push(char)
    }
    // Show colors, then fade them off on this same question, then advance.
    setTimeout(() => {
      chosenKey.value = null
      setTimeout(() => {
        advance()
        locked.value = false
      }, CLEAR_MS)
    }, REVEAL_MS)
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

  /** Back to the category list — keeps the selection, drops the finished pass. */
  function restart() {
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
    [selected, queue, passTotal, incorrect, correct, wrong, from, to, scored, hasRetried],
    () => {
      storage.save<Persisted>(KEY, {
        selected: selected.value,
        queue: queue.value,
        passTotal: passTotal.value,
        incorrect: incorrect.value,
        correct: correct.value,
        wrong: wrong.value,
        from: from.value,
        to: to.value,
        firstCorrect: firstCorrect.value,
        firstTotal: firstTotal.value,
        scored: scored.value,
        hasRetried: hasRetried.value,
      })
    },
    { deep: true },
  )

  return {
    blocks,
    phase,
    selected,
    poolSize,
    selectionName,
    selectionId,
    question,
    chosenKey,
    locked,
    position,
    passTotal,
    correct,
    wrong,
    incorrectCount,
    canRetry,
    pct,
    from,
    to,
    start,
    startPass,
    answer,
    retryIncorrect,
    restart,
  }
}

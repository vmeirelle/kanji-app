import { ref, computed, watch } from 'vue'
import { loadBlocks, type Block } from './data/blocks'
import { modeOf, buildQuestion, type Format, type Question } from './quiz'
import * as storage from './storage'

type Phase = 'block' | 'question' | 'done'

/** The minimal, JSON-serializable slice we persist to localStorage. */
type Persisted = {
  blockId: string
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

const KEY = 'kanji-quiz-state.v3'
const REVEAL_MS = 600 // how long the correct/wrong colors stay lit
const CLEAR_MS = 220 // neutral gap while the colors fade, before the next kanji

export function useQuiz() {
  const blocks = ref<Block[]>([])
  const phase = ref<Phase>('block')
  const blockId = ref<string | null>(null)
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

  const block = computed(() => blocks.value.find((b) => b.id === blockId.value) ?? null)
  const blockName = computed(() => block.value?.name ?? '')
  const byChar = (c: string) => block.value?.kanji.find((k) => k.char === c) ?? null
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
    if (!target || !block.value) return
    question.value = buildQuestion(target, block.value.kanji, modeOf(from.value, to.value))
    chosenKey.value = null
  }

  async function start() {
    blocks.value = await loadBlocks()
    const saved = storage.load<Persisted>(KEY)
    const savedBlock = saved && blocks.value.find((b) => b.id === saved.blockId)
    if (saved && savedBlock && Array.isArray(saved.queue)) {
      blockId.value = saved.blockId
      queue.value = saved.queue
      passTotal.value = saved.passTotal || saved.queue.length
      incorrect.value = saved.incorrect ?? []
      correct.value = saved.correct ?? 0
      wrong.value = saved.wrong ?? 0
      from.value = saved.from ?? 'char'
      to.value = saved.to ?? 'meaning'
      firstCorrect.value = saved.firstCorrect ?? 0
      firstTotal.value = saved.firstTotal ?? 0
      scored.value = saved.scored ?? false
      hasRetried.value = saved.hasRetried ?? false
      if (queue.value.length) {
        newQuestion()
        phase.value = 'question'
      } else {
        phase.value = 'done'
      }
    }
  }

  function selectBlock(id: string) {
    blockId.value = id
    queue.value = block.value ? block.value.kanji.map((k) => k.char) : []
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

  function restart() {
    storage.remove(KEY)
    blockId.value = null
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
    phase.value = 'block'
  }

  // Rebuild the current question when the user toggles From/To mid-quiz.
  watch([from, to], () => {
    if (phase.value === 'question') newQuestion()
  })

  // Persist the durable slice whenever it changes (incl. the done/popup state,
  // so a reload resumes there). Cleared only by restart().
  watch(
    [blockId, queue, passTotal, incorrect, correct, wrong, from, to, scored, hasRetried],
    () => {
      if (blockId.value) {
        storage.save<Persisted>(KEY, {
          blockId: blockId.value,
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
      }
    },
    { deep: true },
  )

  return {
    blocks,
    phase,
    block,
    blockName,
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
    selectBlock,
    answer,
    retryIncorrect,
    restart,
  }
}

import { ref, computed, watch } from 'vue'
import { loadBlocks, type Block, type Kanji } from './data/blocks'
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
}

const REVEAL_MS = 600

export function useQuiz() {
  const blocks = ref<Block[]>([])
  const phase = ref<Phase>('block')
  const blockId = ref<string | null>(null)
  const queue = ref<string[]>([]) // kanji chars left in this pass; [0] is current
  const passTotal = ref(0) // size of the current pass, for the x/total display
  const incorrect = ref<string[]>([]) // chars answered wrong this pass
  const correct = ref(0) // session tally
  const wrong = ref(0) // session tally

  const from = ref<Format>('char') // prompt facet (user-toggled)
  const to = ref<Format>('meaning') // answer facet (user-toggled)

  const question = ref<Question | null>(null)
  const chosenKey = ref<string | null>(null) // the square the user tapped

  const block = computed(() => blocks.value.find((b) => b.id === blockId.value) ?? null)
  const byChar = (c: string) => block.value?.kanji.find((k) => k.char === c) ?? null
  // Question number within the current pass, e.g. 3 of 9.
  const position = computed(() => passTotal.value - queue.value.length + 1)
  const incorrectCount = computed(() => incorrect.value.length)

  /** Build a question for the head of the queue using the current From/To. */
  function newQuestion() {
    const target = queue.value[0] ? byChar(queue.value[0]) : null
    if (!target || !block.value) return
    question.value = buildQuestion(target, block.value.kanji, modeOf(from.value, to.value))
    chosenKey.value = null
  }

  async function start() {
    blocks.value = await loadBlocks()
    const saved = storage.load<Persisted>()
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
    newQuestion()
    phase.value = 'question'
  }

  function answer(key: string) {
    if (chosenKey.value || !question.value) return // ignore taps after reveal
    chosenKey.value = key
    const picked = question.value.options.find((o) => o.key === key)
    const char = queue.value[0]
    if (picked?.correct) {
      correct.value++
    } else {
      wrong.value++
      if (char && !incorrect.value.includes(char)) incorrect.value.push(char)
    }
    setTimeout(advance, REVEAL_MS)
  }

  function advance() {
    queue.value.shift()
    if (queue.value.length) {
      newQuestion()
    } else {
      // End of the pass — let the user decide (retry incorrect / finish).
      question.value = null
      chosenKey.value = null
      phase.value = 'done'
    }
  }

  /** Start a fresh pass over just the kanji missed in the pass that ended. */
  function retryIncorrect() {
    queue.value = incorrect.value
    passTotal.value = queue.value.length
    incorrect.value = []
    correct.value = 0
    wrong.value = 0
    newQuestion()
    phase.value = 'question'
  }

  function restart() {
    storage.clear()
    blockId.value = null
    queue.value = []
    passTotal.value = 0
    incorrect.value = []
    correct.value = 0
    wrong.value = 0
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
    [blockId, queue, passTotal, incorrect, correct, wrong, from, to],
    () => {
      if (blockId.value) {
        storage.save<Persisted>({
          blockId: blockId.value,
          queue: queue.value,
          passTotal: passTotal.value,
          incorrect: incorrect.value,
          correct: correct.value,
          wrong: wrong.value,
          from: from.value,
          to: to.value,
        })
      }
    },
    { deep: true },
  )

  return {
    blocks,
    phase,
    block,
    question,
    chosenKey,
    position,
    passTotal,
    correct,
    wrong,
    incorrectCount,
    from,
    to,
    start,
    selectBlock,
    answer,
    retryIncorrect,
    restart,
  }
}

import { ref, computed, watch } from 'vue'
import { blocksIn, levelsOf, loadBlocks, poolOf, type Block } from '../data/blocks'
import { loadKana } from '../data/kana'
import { modeOf, buildQuestion, shuffle, type Format, type Question } from '../quiz'
import * as storage from '../storage'
import { dropSaved, loadSaved, putSaved, type Round, type SavedLesson } from '../saved'

type Phase = 'ready' | 'question' | 'done'
type Mode = 'custom' | 'ranked'
export type Deck = 'kanji' | 'basics'

type Persisted = Round & { from: Format; to: Format; mode: Mode }

// A size of 0 means "all" (the whole selected pool).
type QuizOpts = { deck: Deck; key: string; load: () => Promise<Block[]>; sizes: number[]; defaultSize: number }

const RANKED_SIZE = 20
const TIMER_MS = 15000
const TICK_MS = 100
// Sentinel chosenKey used when the per-word timer runs out with no answer.
const TIMEOUT_KEY = '__timeout__'

function createQuiz(opts: QuizOpts) {
  const DEFAULT_SIZE = opts.defaultSize
  const blocks = ref<Block[]>([])
  const phase = ref<Phase>('ready')
  const mode = ref<Mode>('custom')
  const chosenLevels = ref<string[]>([])
  const selected = ref<string[]>([])
  const size = ref(opts.defaultSize)
  const savedLessons = ref<SavedLesson[]>([])
  const roundId = ref('')
  const queue = ref<string[]>([])
  const passTotal = ref(0)
  const incorrect = ref<string[]>([])
  const correct = ref(0)
  const wrong = ref(0)

  const firstCorrect = ref(0)
  const firstTotal = ref(0)
  const scored = ref(false)
  const hasRetried = ref(false)

  // Ranked-only: accumulated seconds-left across the pass, and the live countdown.
  const rankedScore = ref(0)
  const remaining = ref(0)
  const secondsLeft = computed(() => Math.ceil(remaining.value / 1000))
  let ticker: ReturnType<typeof setInterval> | undefined

  const from = ref<Format>('char')
  const to = ref<Format>('meaning')

  const question = ref<Question | null>(null)
  const chosenKey = ref<string | null>(null)
  const answered = computed(() => chosenKey.value !== null)

  const levels = computed(() => levelsOf(blocks.value))

  const levelBlocks = computed(() => blocksIn(blocks.value, chosenLevels.value))


  const level = computed(() => chosenLevels.value[0] ?? '')


  function setLevel(l: string) {
    if (chosenLevels.value[0] === l) return
    chosenLevels.value = [l]
    selected.value = blocksIn(blocks.value, [l]).map((b) => b.id)
  }

  // Ranked locks the config: 20 words, Kanji -> Kana, every category in the level.
  function setMode(m: Mode) {
    mode.value = m
    if (m === 'ranked') {
      from.value = 'char'
      to.value = 'kana'
      selected.value = levelBlocks.value.map((b) => b.id)
    }
  }

  const pool = computed(() => poolOf(blocks.value, selected.value))
  const poolSize = computed(() => pool.value.length)

  const sizeOptions = computed(() => opts.sizes)

  // "All" (0) is always selectable; a numeric size locks only if it exceeds the pool.
  const sizeLocked = (n: number) => n !== 0 && n > poolSize.value && n !== opts.sizes[0]

  const maxSize = computed(() => {
    const fits = opts.sizes.filter((n) => n > 0 && n <= poolSize.value)
    return fits.length ? fits[fits.length - 1]! : opts.sizes[0]!
  })

  const activeSize = computed(() => {
    const s = size.value
    if (s === 0) return 0
    return s <= poolSize.value ? s : maxSize.value
  })

  const roundSize = computed(() => {
    if (mode.value === 'ranked') return Math.min(RANKED_SIZE, poolSize.value)
    const a = activeSize.value
    return a === 0 ? poolSize.value : Math.min(a, poolSize.value)
  })
  const byChar = (c: string) => pool.value.find((k) => k.char === c) ?? null
  const chosenBlocks = computed(() => blocks.value.filter((b) => selected.value.includes(b.id)))

  const selectionName = computed(() => {
    const names = chosenBlocks.value.map((b) => `${b.level} ${b.name}`)
    return names.length > 2 ? `${names[0]} +${names.length - 1}` : names.join(' · ')
  })

  const position = computed(() => passTotal.value - queue.value.length + 1)
  const incorrectCount = computed(() => incorrect.value.length)

  const pct = computed(() =>
    firstTotal.value ? Math.round((firstCorrect.value / firstTotal.value) * 100) : 0,
  )

  // Custom rounds can retry their misses repeatedly until none remain.
  const canRetry = computed(() => mode.value === 'custom' && incorrectCount.value > 0)


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


  function applyRound(r: Round) {
    chosenLevels.value = r.levels.slice(0, 1)
    selected.value = r.selected
    size.value = r.size ?? DEFAULT_SIZE
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

  function stopTimer() {
    if (ticker) {
      clearInterval(ticker)
      ticker = undefined
    }
  }

  // Wall-clock based: `remaining` is derived from a fixed deadline, so a
  // throttled/coalesced interval (e.g. background tabs) can't drift the score.
  function startTimer() {
    stopTimer()
    const deadline = Date.now() + TIMER_MS
    remaining.value = TIMER_MS
    ticker = setInterval(() => {
      remaining.value = Math.max(0, deadline - Date.now())
      if (remaining.value <= 0) {
        stopTimer()
        timeout()
      }
    }, TICK_MS)
  }


  function newQuestion() {
    const target = queue.value[0] ? byChar(queue.value[0]) : null
    if (!target) return
    question.value = buildQuestion(target, pool.value, modeOf(from.value, to.value))
    chosenKey.value = null
    if (mode.value === 'ranked') startTimer()
  }

  async function start() {
    blocks.value = await opts.load()
    savedLessons.value = opts.deck === 'kanji' ? loadSaved() : []
    const saved = storage.load<Persisted>(opts.key)

    chosenLevels.value = (saved?.levels ?? [])
      .filter((l) => levels.value.includes(l))
      .slice(0, 1)
    if (!chosenLevels.value.length) chosenLevels.value = levels.value.slice(0, 1)
    selected.value = (saved?.selected ?? []).filter((id) =>
      levelBlocks.value.some((b) => b.id === id),
    )
    size.value = saved?.size ?? DEFAULT_SIZE
    if (!saved) {
      selected.value = levelBlocks.value.map((b) => b.id)
      return
    }
    from.value = saved.from ?? 'char'
    to.value = saved.to ?? 'meaning'
    mode.value = saved.mode ?? 'custom'

    // Ranked runs aren't resumable (timer/score integrity); always start fresh.
    if (mode.value === 'ranked') {
      setMode('ranked')
      return
    }

    const q = (saved.queue ?? []).filter((c) => pool.value.some((k) => k.char === c))
    if (!q.length || q.length !== saved.queue?.length) return
    applyRound(saved)
    newQuestion()
    phase.value = 'question'
  }


  function resume(id: string) {
    const lesson = savedLessons.value.find((l) => l.id === id)
    if (!lesson) return
    savedLessons.value = dropSaved(savedLessons.value, id)
    applyRound(lesson)

    queue.value = lesson.queue.filter((c) => pool.value.some((k) => k.char === c))
    if (!queue.value.length) return
    roundId.value = lesson.id
    newQuestion()
    phase.value = 'question'
  }

  function drop(id: string) {
    savedLessons.value = dropSaved(savedLessons.value, id)
  }


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
    rankedScore.value = 0
    newQuestion()
    phase.value = 'question'
  }

  function answer(key: string) {
    if (answered.value || !question.value) return
    stopTimer()
    chosenKey.value = key
    const picked = question.value.options.find((o) => o.key === key)
    const char = queue.value[0]
    if (picked?.correct) {
      correct.value++
      if (mode.value === 'ranked') {
        rankedScore.value += Math.max(0, Math.floor(remaining.value / 1000))
      }
    } else {
      wrong.value++
      if (char && !incorrect.value.includes(char)) incorrect.value.push(char)
    }
  }

  // Timer expired with no pick: count it wrong (0 pts) and flip the card red.
  function timeout() {
    if (answered.value || !question.value) return
    chosenKey.value = TIMEOUT_KEY
    wrong.value++
    const char = queue.value[0]
    if (char && !incorrect.value.includes(char)) incorrect.value.push(char)
  }


  function next() {
    if (answered.value) advance()
  }

  function advance() {
    queue.value.shift()
    if (queue.value.length) {
      newQuestion()
    } else {

      stopTimer()
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
    stopTimer()
    // Only custom kanji rounds can be paused/resumed; ranked & basics are discarded.
    if (queue.value.length && mode.value === 'custom' && opts.deck === 'kanji') {
      savedLessons.value = putSaved(savedLessons.value, {
        ...roundOf(),
        id: roundId.value || String(Date.now()),
        label: selectionName.value,
        date: new Date().toISOString(),
      })
    }
    rankedScore.value = 0
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

  watch([from, to], () => {
    if (phase.value === 'question') newQuestion()
  })

  watch(
    [mode, chosenLevels, selected, size, queue, passTotal, incorrect, correct, wrong, from, to, scored, hasRetried],
    () => {
      storage.save<Persisted>(opts.key, { ...roundOf(), from: from.value, to: to.value, mode: mode.value })
    },
    { deep: true },
  )

  return {
    deck: opts.deck,
    blocks,
    phase,
    mode,
    setMode,
    rankedScore,
    remaining,
    secondsLeft,
    levels,
    level,
    setLevel,
    levelBlocks,
    selected,
    poolSize,
    size,
    sizeOptions,
    sizeLocked,
    activeSize,
    roundSize,
    savedLessons,
    resume,
    drop,
    question,
    chosenKey,
    answered,
    position,
    passTotal,
    correct,
    wrong,
    incorrectCount,
    canRetry,
    hasRetried,
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

export type Quiz = ReturnType<typeof createQuiz>

// One shared instance per deck so every view reads and writes the same state.
let kanji: Quiz | null = null
let basics: Quiz | null = null

export function useQuiz(): Quiz {
  return (kanji ??= createQuiz({
    deck: 'kanji',
    key: 'kanji-quiz-state.v7',
    load: loadBlocks,
    sizes: [5, 10, 20, 50, 100],
    defaultSize: 20,
  }))
}

export function useBasics(): Quiz {
  return (basics ??= createQuiz({
    deck: 'basics',
    key: 'kana-quiz-state.v1',
    load: loadKana,
    // 0 = "All"; always selectable.
    sizes: [5, 10, 20, 0],
    defaultSize: 20,
  }))
}

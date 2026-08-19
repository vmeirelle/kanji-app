<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuiz } from './composables/useQuiz'
import { useBreakpoint } from './composables/useBreakpoint'
import { loadRankings, addRanking, today, type Ranking } from './rankings'
import { levelColor } from './data/blocks'
import { FORMATS } from './quiz'
import BaseSegment from './components/base/BaseSegment.vue'
import CategoryList from './views/CategoryList.vue'
import QuizView from './views/QuizView.vue'
import RankingView from './views/RankingView.vue'
import SavedView from './views/SavedView.vue'
import NotFound from './views/NotFound.vue'
import NavDrawer, { type NavItem } from './components/base/NavDrawer.vue'

const NAV: NavItem[] = [
  { id: 'learn', label: 'Learn', icon: '📖' },
  { id: 'saved', label: 'Unfinished', icon: '⏸️' },
  { id: 'ranking', label: 'Ranking', icon: '🏆' },
]

const q = useQuiz()
const { isDesktop } = useBreakpoint()
const view = ref('learn')
const menuOpen = ref(false)
const rankings = ref<Ranking[]>([])
const name = ref('')
const saved = ref(false)

onMounted(() => {
  q.start()
  rankings.value = loadRankings()
})

const progress = computed(() =>
  q.passTotal.value ? (q.position.value / q.passTotal.value) * 100 : 0,
)

const resultSticker = computed(() => {
  const p = q.pct.value
  if (p >= 90) return '/eureka.png'
  if (p >= 70) return '/happy.png'
  if (p >= 40) return '/confused.png'
  return '/dead.png'
})

const modeOptions = [
  { value: 'custom', label: 'Custom' },
  { value: 'ranked', label: 'Ranked' },
]
const levelOptions = computed(() =>
  q.levels.value.map((l) => ({ value: l, label: l, accent: levelColor(l) })),
)
const sizeOptions = computed(() =>
  q.sizeOptions.value.map((n) => ({
    value: n,
    label: String(n),
    disabled: q.sizeLocked(n),
    title: q.sizeLocked(n) ? `Only ${q.poolSize.value} kanji at this level` : undefined,
  })),
)
const formatOptions = FORMATS.map((f) => ({ value: f.id, label: f.label }))

function go(id: string) {
  view.value = id
  menuOpen.value = false
}

function goHome() {
  view.value = 'learn'
  menuOpen.value = false
  if (q.phase.value !== 'ready') q.restart()
}

function resumeLesson(id: string) {
  q.resume(id)
  view.value = 'learn'
}

function saveScore() {
  if (!name.value.trim() || saved.value || q.mode.value !== 'ranked') return
  rankings.value = addRanking({
    name: name.value.trim(),
    level: q.level.value,
    correct: q.firstCorrect.value,
    total: q.firstTotal.value,
    points: q.rankedScore.value,
    day: today(),
    date: new Date().toISOString(),
  })
  saved.value = true
}

function finish() {
  q.restart()
  name.value = ''
  saved.value = false
}
</script>

<template>
  <div class="shell">

    <aside class="side">
      <button class="side-brand" aria-label="Home" @click="goHome">
        <img class="logo" src="/logo.png" alt="Kanji Quiz" />
      </button>
      <nav class="tabs">
        <button
          v-for="item in NAV"
          :key="item.id"
          class="tab"
          :class="{ active: item.id === view }"
          @click="go(item.id)"
        >
          <span v-if="item.icon" class="ic">{{ item.icon }}</span>{{ item.label }}
        </button>
      </nav>
    </aside>

    <main class="app">
      <header class="top">
        <button class="ham" aria-label="Menu" @click="menuOpen = !menuOpen">☰</button>
        <button class="brand" aria-label="Home" @click="goHome">
          <img class="logo" src="/logo.png" alt="Kanji Quiz" />
        </button>
      </header>

    <NavDrawer
      v-if="!isDesktop"
      :open="menuOpen"
      :items="NAV"
      :active="view"
      @select="go"
      @home="goHome"
      @close="menuOpen = false"
    />


    <template v-if="view === 'learn'">

      <section v-if="q.phase.value === 'ready'" class="pick" :style="{ '--lv': levelColor(q.level.value) }">
        <div class="card">
          <span class="tag">Game</span>
          <BaseSegment
            :options="modeOptions"
            :model-value="q.mode.value"
            @update:model-value="q.setMode($event as 'custom' | 'ranked')"
          />

          <span class="tag">Japanese level</span>
          <BaseSegment
            :options="levelOptions"
            :model-value="q.level.value"
            @update:model-value="q.setLevel($event)"
          />

          <div class="head">
            <span class="tag">Kanji per round</span>
            <span class="sub">{{ q.roundSize.value }} of {{ q.poolSize.value }} selected</span>
          </div>
          <BaseSegment
            :options="sizeOptions"
            :model-value="q.activeSize.value"
            :disabled="q.mode.value === 'ranked'"
            @update:model-value="q.size.value = $event"
          />

          <div class="duo">
            <div class="col">
              <span class="tag">Show (From)</span>
              <BaseSegment
                :options="formatOptions"
                :disabled="q.mode.value === 'ranked'"
                v-model="q.from.value"
              />
            </div>
            <div class="col">
              <span class="tag">Answer (To)</span>
              <BaseSegment
                :options="formatOptions"
                :disabled="q.mode.value === 'ranked'"
                v-model="q.to.value"
              />
            </div>
          </div>
        </div>

        <CategoryList
          :blocks="q.levelBlocks.value"
          v-model:selected="q.selected.value"
          :disabled="q.mode.value === 'ranked'"
        />

        <button class="btn primary" :disabled="!q.poolSize.value" @click="q.startPass">
          {{ q.mode.value === 'ranked' ? `Start ranked · ${q.roundSize.value} words` : `Start · ${q.roundSize.value} kanji` }}
        </button>
      </section>


      <section v-else-if="q.phase.value === 'question' && q.question.value">
        <div class="bar">
          <button class="stop" @click="finish">✕ Stop</button>
          <span>{{ q.position.value }}/{{ q.passTotal.value }}</span>
          <span class="tally">
            <span v-if="q.mode.value === 'ranked'" class="pts">★ {{ q.rankedScore.value }}</span>
            <span class="ok">✓ {{ q.correct.value }}</span>
            <span class="no">✗ {{ q.wrong.value }}</span>
          </span>
        </div>
        <div class="progress"><div class="fill" :style="{ width: progress + '%' }" /></div>
        <QuizView
          :prompt="q.question.value.prompt"
          :question="q.question.value"
          :chosen-key="q.chosenKey.value"
          :disabled="q.answered.value"
          :countdown="q.mode.value === 'ranked' ? q.secondsLeft.value : null"
          @answer="q.answer"
        />

        <div v-if="q.answered.value" class="tap-next" @click="q.next">
          <span class="tap-hint">Tap anywhere for next</span>
        </div>
      </section>


      <div v-else class="overlay">
        <div class="modal">
          <img class="modal-sticker" :src="resultSticker" alt="" />
          <p class="lead">Round complete 🎉</p>
          <p v-if="q.mode.value === 'ranked'" class="score">{{ q.rankedScore.value }} pts</p>
          <p class="hint">
            {{ q.firstCorrect.value }}/{{ q.firstTotal.value }} correct · {{ q.pct.value }}%
          </p>
          <p class="hint">{{ q.level.value }} · {{ q.mode.value === 'ranked' ? 'Ranked' : 'Custom' }}</p>

          <button v-if="q.canRetry.value" class="btn" @click="q.retryIncorrect">
            Retry incorrect ({{ q.incorrectCount.value }})
          </button>

          <template v-if="q.mode.value === 'ranked'">
            <input
              v-model="name"
              class="input"
              type="text"
              placeholder="Your name"
              maxlength="20"
              :disabled="saved"
              @keyup.enter="saveScore"
            />
            <button
              class="btn primary"
              :class="{ done: saved }"
              :disabled="saved || !name.trim()"
              @click="saveScore"
            >
              {{ saved ? 'Saved ' : 'Save to ranking' }}
            </button>
          </template>

          <button class="btn" @click="finish">Finish</button>
        </div>
      </div>
    </template>


    <SavedView
      v-else-if="view === 'saved'"
      :lessons="q.savedLessons.value"
      @resume="resumeLesson"
      @drop="q.drop"
    />


    <RankingView v-else-if="view === 'ranking'" :rankings="rankings" :levels="q.levels.value" />

    <NotFound v-else />
    </main>
  </div>
</template>

<style scoped>
.shell {
  width: 100%;
}
.app {
  max-width: 30rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 100vh;
}
.top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ham {
  border: none;
  background: transparent;
  color: var(--color-heading);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}
.brand {
  margin-left: auto;
  display: flex;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}
.logo {
  height: 2.6rem;
  border-radius: 0.5rem;
}
.side {
  display: none;
}
.side-brand {
  border: none;
  background: transparent;
  padding: 0 0.5rem;
  cursor: pointer;
  align-self: flex-start;
}
.tabs {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.tab {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  text-align: left;
  border: none;
  border-radius: 0.6rem;
  background: transparent;
  color: var(--color-heading);
  font-size: 0.95rem;
  cursor: pointer;
}
.tab:hover {
  background: var(--color-background-soft);
}
.tab.active {
  background: var(--color-background-soft);
  color: var(--brand);
  font-weight: 600;
}

@media (min-width: 48rem) {

  .shell {
    display: grid;
    grid-template-columns: 13rem minmax(0, 1fr);
  }
  .side {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 0;
    align-self: start;
    padding: 1.5rem 0.75rem;
    border-right: 1px solid var(--color-border);
    min-height: 100vh;
  }
  .top {
    display: none;
  }
  .app {
    max-width: 34rem;
    padding: 1.5rem 1.5rem 3rem;
    width: 100%;
  }
}
.pick {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
}

.pick > .btn.primary {
  margin-top: auto;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  min-width: 0;
}
.tag {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.sub {
  font-size: 0.75rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.lead {
  text-align: center;
  font-size: 1.25rem;
  color: var(--color-heading);
}
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: var(--color-text);
}
.tally {
  display: flex;
  gap: 0.75rem;
}
.tally .pts {
  color: var(--brand);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.stop {
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.85rem;
  padding: 0.25rem 0.25rem 0.25rem 0;
  cursor: pointer;
}
.ok {
  color: #16a34a;
}
.no {
  color: #dc2626;
}
.progress {
  height: 0.5rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  overflow: hidden;
  margin: 0.6rem 0 1.25rem;
}
.fill {
  height: 100%;
  background: var(--brand);
  border-radius: 999px;
  transition: width 0.25s ease;
}
.tap-next {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 1.5rem;
}
.tap-hint {
  color: var(--color-text);
  font-size: 0.85rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
}
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
}
.modal {
  width: 100%;
  max-width: 22rem;
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
}
.modal-sticker {
  width: 7rem;
  align-self: center;
}
.score {
  font-size: 2.75rem;
  font-weight: 700;
  color: #16a34a;
  line-height: 1;
}
.hint {
  font-size: 0.85rem;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}
.btn.primary.done {
  opacity: 1;
  border-color: #16a34a;
  background: #16a34a;
  color: #fff;
}
.input {
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 0.9rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 1rem;
  text-align: center;
}
.input:focus {
  outline: none;
  border-color: var(--brand);
}
.btn {
  padding: 0.85rem 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: 0.9rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 1rem;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.btn.primary {
  border-color: var(--lv, var(--brand));
  background: var(--lv, var(--brand));
  color: #fff;
}
</style>

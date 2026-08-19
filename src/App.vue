<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuiz } from './useQuiz'
import { loadRankings, addRanking, type Ranking } from './rankings'
import SquareGrid, { type GridItem } from './components/SquareGrid.vue'
import QuizView from './components/QuizView.vue'
import RankingView from './components/RankingView.vue'
import SettingsView from './components/SettingsView.vue'
import NavDrawer, { type NavItem } from './components/NavDrawer.vue'

// The menu is data-driven — add a NavItem (and a matching branch) for new tabs.
const NAV: NavItem[] = [
  { id: 'learn', label: 'Learn', icon: '📖' },
  { id: 'ranking', label: 'Ranking', icon: '🏆' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

const q = useQuiz()
const view = ref('learn')
const menuOpen = ref(false)
const rankings = ref<Ranking[]>([])
const name = ref('')
const saved = ref(false)

onMounted(() => {
  q.start()
  rankings.value = loadRankings()
})

const blockItems = computed<GridItem[]>(() =>
  q.blocks.value.map((b) => ({ key: b.id, label: b.name })),
)
// Fill fraction for the progress bar (current question / pass size).
const progress = computed(() =>
  q.passTotal.value ? (q.position.value / q.passTotal.value) * 100 : 0,
)

function go(id: string) {
  view.value = id
  menuOpen.value = false
}

function saveScore() {
  if (!name.value.trim() || saved.value || !q.block.value) return
  rankings.value = addRanking({
    name: name.value.trim(),
    blockId: q.block.value.id,
    blockName: q.blockName.value,
    pct: q.pct.value,
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
  <main class="app">
    <header class="top">
      <button class="ham" aria-label="Menu" @click="menuOpen = !menuOpen">☰</button>
      <h1 class="title">漢字</h1>
    </header>

    <NavDrawer
      :open="menuOpen"
      :items="NAV"
      :active="view"
      @select="go"
      @close="menuOpen = false"
    />

    <!-- LEARN -->
    <template v-if="view === 'learn'">
      <!-- Pick a block (the only setup tap) -->
      <section v-if="q.phase.value === 'block'">
        <SquareGrid :items="blockItems" @select="q.selectBlock" />
      </section>

      <!-- Answer questions -->
      <section v-else-if="q.phase.value === 'question' && q.question.value">
        <div class="bar">
          <span>{{ q.position.value }}/{{ q.passTotal.value }}</span>
          <span class="tally">
            <span class="ok">✓ {{ q.correct.value }}</span>
            <span class="no">✗ {{ q.wrong.value }}</span>
          </span>
        </div>
        <div class="progress"><div class="fill" :style="{ width: progress + '%' }" /></div>
        <QuizView
          :prompt="q.question.value.prompt"
          :question="q.question.value"
          :chosen-key="q.chosenKey.value"
          :disabled="q.locked.value"
          @answer="q.answer"
        />
      </section>

      <!-- End-of-pass popup -->
      <div v-else class="overlay">
        <div class="modal">
          <p class="lead">Block complete 🎉</p>
          <p class="score">{{ q.pct.value }}%</p>
          <p class="hint">First-try score on {{ q.blockName.value }}</p>

          <button v-if="q.canRetry.value" class="btn" @click="q.retryIncorrect">
            Retry incorrect ({{ q.incorrectCount.value }})
          </button>

          <template v-if="!saved">
            <input
              v-model="name"
              class="input"
              type="text"
              placeholder="Your name"
              maxlength="20"
              @keyup.enter="saveScore"
            />
            <button class="btn primary" :disabled="!name.trim()" @click="saveScore">
              Save to ranking
            </button>
          </template>
          <p v-else class="saved">Saved ✓</p>

          <button class="btn" @click="finish">Finish</button>
        </div>
      </div>
    </template>

    <!-- RANKING -->
    <RankingView v-else-if="view === 'ranking'" :rankings="rankings" />

    <!-- SETTINGS -->
    <SettingsView v-else v-model:from="q.from.value" v-model:to="q.to.value" />
  </main>
</template>

<style scoped>
.app {
  max-width: 30rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
.title {
  flex: 1;
  font-size: 1.5rem;
  text-align: center;
  color: var(--color-heading);
  margin-right: 2.5rem; /* balance the hamburger so the title stays centered */
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
  background: #16a34a;
  border-radius: 999px;
  transition: width 0.25s ease;
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
.saved {
  color: #16a34a;
  font-weight: 600;
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
  border-color: #16a34a;
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
  border-color: #16a34a;
  background: #16a34a;
  color: #fff;
}
</style>

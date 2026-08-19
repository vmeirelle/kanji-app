<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuiz } from './useQuiz'
import { loadRankings, addRanking, today, pointsOf, type Ranking } from './rankings'
import { levelColor } from './data/blocks'
import CategoryList from './components/CategoryList.vue'
import QuizView from './components/QuizView.vue'
import RankingView from './components/RankingView.vue'
import SavedView from './components/SavedView.vue'
import SettingsView from './components/SettingsView.vue'
import NavDrawer, { type NavItem } from './components/NavDrawer.vue'

// The menu is data-driven — add a NavItem (and a matching branch) for new tabs.
const NAV: NavItem[] = [
  { id: 'learn', label: 'Learn', icon: '📖' },
  { id: 'saved', label: 'Unfinished', icon: '⏸️' },
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

// Fill fraction for the progress bar (current question / pass size).
const progress = computed(() =>
  q.passTotal.value ? (q.position.value / q.passTotal.value) * 100 : 0,
)

function go(id: string) {
  view.value = id
  menuOpen.value = false
}

// The logo is Home: back to Learn, abandoning any run in progress.
function goHome() {
  view.value = 'learn'
  menuOpen.value = false
  if (q.phase.value !== 'ready') q.restart()
}

// Picking up a paused lesson drops you straight back into the questions.
function resumeLesson(id: string) {
  q.resume(id)
  view.value = 'learn'
}

function saveScore() {
  if (!name.value.trim() || saved.value || !q.selected.value.length) return
  rankings.value = addRanking({
    name: name.value.trim(),
    blockId: q.selectionId.value,
    blockName: q.selectionName.value,
    correct: q.firstCorrect.value,
    total: q.firstTotal.value,
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
    <!-- Desktop navigation. Narrow screens hide this and use the drawer instead. -->
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
      :open="menuOpen"
      :items="NAV"
      :active="view"
      @select="go"
      @home="goHome"
      @close="menuOpen = false"
    />

    <!-- LEARN -->
    <template v-if="view === 'learn'">
      <!-- Levels mix freely; categories follow whatever is checked. Both remembered. -->
      <section v-if="q.phase.value === 'ready'" class="pick">
        <div class="field">
          <span class="tag">Difficulty</span>
          <div class="chips" role="group" aria-label="Difficulty">
            <label
              v-for="l in q.levels.value"
              :key="l"
              class="chip"
              :class="{ on: q.chosenLevels.value.includes(l) }"
              :style="{ '--lv': levelColor(l) }"
            >
              <input
                class="sr"
                type="checkbox"
                :checked="q.chosenLevels.value.includes(l)"
                :disabled="q.isOnlyLevel(l)"
                @change="q.toggleLevel(l)"
              />
              {{ l }}
            </label>
          </div>
        </div>

        <div class="field">
          <span class="tag">Kanji per round</span>
          <div class="chips" role="radiogroup" aria-label="Kanji per round">
            <label
              v-for="n in q.sizeOptions.value"
              :key="n"
              class="chip"
              :class="{ on: q.size.value === n }"
            >
              <input
                class="sr"
                type="radio"
                name="size"
                :checked="q.size.value === n"
                @change="q.size.value = n"
              />
              {{ n || 'All' }}
            </label>
          </div>
        </div>

        <CategoryList :blocks="q.levelBlocks.value" v-model:selected="q.selected.value" />

        <div class="startbar">
          <button class="btn primary" :disabled="!q.poolSize.value" @click="q.startPass">
            Start · {{ q.roundSize.value }} kanji
          </button>
        </div>
      </section>

      <!-- Answer questions -->
      <section v-else-if="q.phase.value === 'question' && q.question.value">
        <div class="bar">
          <button class="stop" @click="finish">✕ Stop</button>
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
          :disabled="q.answered.value"
          @answer="q.answer"
        />
        <!-- After answering, a tap anywhere goes to the next kanji. -->
        <div v-if="q.answered.value" class="tap-next" @click="q.next">
          <span class="tap-hint">Tap anywhere for next</span>
        </div>
      </section>

      <!-- End-of-pass popup -->
      <div v-else class="overlay">
        <div class="modal">
          <p class="lead">Round complete 🎉</p>
          <p class="score">{{ pointsOf(q.firstCorrect.value, q.firstTotal.value) }} pts</p>
          <p class="hint">
            {{ q.firstCorrect.value }}/{{ q.firstTotal.value }} correct · {{ q.pct.value }}%
          </p>
          <p class="hint">First try on {{ q.selectionName.value }}</p>

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

    <!-- UNFINISHED -->
    <SavedView
      v-else-if="view === 'saved'"
      :lessons="q.savedLessons.value"
      @resume="resumeLesson"
      @drop="q.drop"
    />

    <!-- RANKING -->
    <RankingView v-else-if="view === 'ranking'" :rankings="rankings" />

    <!-- SETTINGS -->
    <SettingsView v-else v-model:from="q.from.value" v-model:to="q.to.value" />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 90%;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
/* Keep the Start button pinned to the bottom of the screen while the
   category list scrolls, so it's never scrolled out of reach. */
.startbar {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  margin: 0 -1rem; /* span to the padded edges of .app */
  padding: 0.75rem 1rem;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
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
  margin-left: auto; /* push the logo to the right edge */
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
  display: none; /* mobile: the drawer covers navigation */
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

/* Desktop: a standing sidebar replaces the header and the drawer. */
@media (min-width: 48rem) {
  /* The sidebar + content form one bounded slab, centred on the page, so wide
     screens get balanced margins instead of a lone column floating far right. */
  .shell {
    display: grid;
    grid-template-columns: 13rem minmax(0, 1fr);
    max-width: 72rem;
    margin: 0 auto;
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
    display: none; /* logo and nav live in the sidebar */
  }
  .app {
    max-width: none; /* fill the content column of the bounded slab */
    margin: 0;
    padding: 1.5rem 1.5rem 3rem;
  }
}
.pick {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
/* Difficulty and round-size sit as flat labelled fields — same language as the
   category list and settings, rather than a boxed-off card. */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.tag {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  padding: 0.5rem 0.9rem;
  border: 1.5px solid var(--color-border);
  border-radius: 0.7rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background-color 0.15s ease;
}
.chip:hover {
  border-color: var(--color-border-hover);
}
/* Selected: tinted by the level accent (or brand for round-size). */
.chip.on {
  border-color: var(--lv, var(--brand));
  color: var(--lv, var(--brand));
  background: var(--color-background-soft);
  background: color-mix(in srgb, var(--lv, var(--brand)) 10%, var(--color-background-soft));
  font-weight: 600;
}
/* Focus lands on the hidden native input; surface a ring on the chip. */
.chip:has(input:focus-visible) {
  outline: 2px solid var(--lv, var(--brand));
  outline-offset: 2px;
}
/* The last level on cannot be turned off — the pool would be empty. */
.chip:has(input:disabled) {
  cursor: default;
  opacity: 0.5;
}
/* Native checkbox/radio drives state + accessibility; the chip is the visual. */
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
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
  color: var(--brand);
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
  border-color: var(--brand);
  background: var(--brand);
  color: #fff;
}
</style>

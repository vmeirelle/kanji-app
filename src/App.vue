<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useQuiz } from './composables/useQuiz'
import { useRankings } from './composables/useRankings'
import { useBreakpoint } from './composables/useBreakpoint'
import { levelColor } from './data/blocks'
import AppBrand from './components/base/AppBrand.vue'
import KanjiBadge from './components/base/KanjiBadge.vue'
import LearnView from './views/LearnView.vue'
import RankingView from './views/RankingView.vue'
import SavedView from './views/SavedView.vue'
import NotFound from './views/NotFound.vue'
import NavDrawer, { type NavItem } from './components/base/NavDrawer.vue'

const NAV: NavItem[] = [
  { id: 'learn', label: 'Learn', kanji: '学' },
  { id: 'saved', label: 'Unfinished', kanji: '未' },
  { id: 'ranking', label: 'Ranking', kanji: '位' },
]

const q = useQuiz()
const { rankings } = useRankings()
const { isDesktop } = useBreakpoint()
const view = ref('learn')
const menuOpen = ref(false)

// A cor do nível escolhido vira luz ambiente do app inteiro.
const accent = computed(() => levelColor(q.level.value))

onMounted(() => q.start())

function go(id: string) {
  // Ranked matches can't be left mid-round — navigating away forfeits it.
  if (id !== 'learn' && q.mode.value === 'ranked' && q.phase.value !== 'ready') q.restart()
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
</script>

<template>
  <div class="shell" :style="{ '--accent': accent }">
    <aside class="side">
      <button class="side-brand" aria-label="Home" @click="goHome">
        <AppBrand />
      </button>

      <nav class="tabs">
        <button
          v-for="item in NAV"
          :key="item.id"
          class="tab"
          :class="{ active: item.id === view }"
          @click="go(item.id)"
        >
          <span class="rail" aria-hidden="true" />
          <KanjiBadge :char="item.kanji" round :size="1.7" />
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <main class="app">
      <header class="top">
        <button class="ham" aria-label="Menu" @click="menuOpen = !menuOpen">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <button class="brand" aria-label="Home" @click="goHome">
          <AppBrand end />
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

      <Transition name="view" mode="out-in">
        <LearnView v-if="view === 'learn'" key="learn" />

        <SavedView
          v-else-if="view === 'saved'"
          key="saved"
          :lessons="q.savedLessons.value"
          @resume="resumeLesson"
          @drop="q.drop"
        />

        <RankingView
          v-else-if="view === 'ranking'"
          key="ranking"
          :rankings="rankings"
          :levels="q.levels.value"
        />

        <NotFound v-else key="404" />
      </Transition>
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
  padding: 1.25rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 100vh;
}

/* --- topo (mobile) ------------------------------------------------ */
.top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ham {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border: none;
  border-radius: var(--r-sm);
  background: transparent;
  cursor: pointer;
  transition: background 0.2s var(--ease-soft);
}
.ham:hover {
  background: var(--color-background-soft);
}
.ham svg {
  width: 1.4rem;
  height: 1.4rem;
  fill: none;
  stroke: var(--color-heading);
  stroke-width: 1.8;
  stroke-linecap: round;
}
.brand {
  margin-left: auto;
  display: flex;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

/* --- barra lateral (desktop) --------------------------------------- */
.side {
  display: none;
}
.side-brand {
  border: none;
  background: transparent;
  padding: 0 0.75rem;
  cursor: pointer;
  align-self: flex-start;
  transition: transform 0.3s var(--ease-spring);
}
.side-brand:hover,
.brand:hover {
  transform: translateY(-2px);
}

.tabs {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  text-align: left;
  border: none;
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--color-text);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s var(--ease-soft), color 0.2s var(--ease-soft);
}
.tab :deep(.badge) {
  transition: transform 0.25s var(--ease-spring), box-shadow 0.25s var(--ease-soft);
}
.tab:hover {
  background: var(--color-background-soft);
  color: var(--color-heading);
}
.tab:hover :deep(.badge) {
  transform: translateY(-2px) rotate(-3deg);
  box-shadow: var(--shadow-md);
}

/* Trilho de tinta que marca a aba ativa. */
.rail {
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 0;
  border-radius: 0 3px 3px 0;
  background: var(--accent, var(--brand));
  transform: translateY(-50%);
  transition: height 0.3s var(--ease-spring);
}
.tab.active {
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-weight: 600;
}
.tab.active .rail {
  height: 64%;
}

@media (min-width: 48rem) {
  .shell {
    display: grid;
    grid-template-columns: var(--sidebar) minmax(0, 1fr);
  }
  .side {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 0;
    align-self: start;
    padding: 1.5rem 0.75rem 1rem;
    border-right: 1px solid var(--color-border);
    min-height: 100vh;
    background: var(--color-background-soft);
  }
  .top {
    display: none;
  }
  .app {
    max-width: 34rem;
    padding: 2rem 1.5rem 3rem;
    width: 100%;
  }
}

/* --- transição entre telas ------------------------------------------ */
.view-enter-active {
  transition: opacity 0.28s var(--ease-soft), transform 0.28s var(--ease-ink);
}
.view-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.view-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.view-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

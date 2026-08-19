<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQuiz } from './composables/useQuiz'
import { useRankings } from './composables/useRankings'
import { useBreakpoint } from './composables/useBreakpoint'
import LearnView from './views/LearnView.vue'
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
const { rankings } = useRankings()
const { isDesktop } = useBreakpoint()
const view = ref('learn')
const menuOpen = ref(false)

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

      <LearnView v-if="view === 'learn'" />

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
    grid-template-columns: var(--sidebar) minmax(0, 1fr);
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
</style>

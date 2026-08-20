<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQuiz, useBasics } from './composables/useQuiz'
import { useRankings } from './composables/useRankings'
import { useAuth } from './composables/useAuth'
import { useSettings } from './composables/useSettings'
import { useBreakpoint } from './composables/useBreakpoint'
import AppBrand from './components/base/AppBrand.vue'
import KanjiBadge from './components/base/KanjiBadge.vue'
import FadeTransition from './components/base/FadeTransition.vue'
import LoginModal from './components/base/LoginModal.vue'
import HomeView from './views/HomeView.vue'
import LearnView from './views/LearnView.vue'
import BasicsView from './views/BasicsView.vue'
import VocabularyView from './views/VocabularyView.vue'
import RankingView from './views/RankingView.vue'
import SavedView from './views/SavedView.vue'
import SettingsView from './views/SettingsView.vue'
import NotFound from './views/NotFound.vue'
import NavDrawer, { type NavItem } from './components/base/NavDrawer.vue'
import BaseText from './components/base/BaseText.vue'
import { Size } from './composables/useTheme'

const NAV: NavItem[] = [
  { id: 'home', label: 'Home', kanji: '家' },
  { id: 'basics', label: 'Basics', kanji: 'あ' },
  { id: 'learn', label: 'Learn', kanji: '学' },
  { id: 'vocab', label: 'Reading', kanji: '読' },
  { id: 'saved', label: 'Unfinished', kanji: '未' },
  { id: 'ranking', label: 'Ranking', kanji: '位' },
  { id: 'settings', label: 'Settings', kanji: '設' },
]

const q = useQuiz()
const basics = useBasics()
const { rankings, loading: rankingsLoading, error: rankingsError, refresh: refreshRankings } = useRankings()
const { promptOpen, closeLogin, restore } = useAuth()
useSettings()
const { isDesktop } = useBreakpoint()
const view = ref('home')
const menuOpen = ref(false)

onMounted(() => {
  q.start()
  basics.start()
  restore()
})

function go(id: string) {
  if (id !== 'learn' && q.mode.value === 'ranked' && q.phase.value !== 'ready') q.restart()
  view.value = id
  menuOpen.value = false
  if (id === 'ranking') refreshRankings()
}

function goHome() {
  view.value = 'home'
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
          <KanjiBadge :char="item.kanji" round :size="1.7" />{{ item.label }}
        </button>
      </nav>
    </aside>

    <main class="app">
      <header class="top">
        <button class="ham" aria-label="Menu" @click="menuOpen = !menuOpen">
          <BaseText :size="Size.Lg">☰</BaseText>
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

      <FadeTransition>
        <HomeView v-if="view === 'home'" @go="go" />

        <LearnView v-else-if="view === 'learn'" />

        <BasicsView v-else-if="view === 'basics'" />

        <VocabularyView v-else-if="view === 'vocab'" @practice="go('learn')" />

        <SavedView
          v-else-if="view === 'saved'"
          :lessons="q.savedLessons.value"
          @resume="resumeLesson"
          @drop="q.drop"
        />

        <RankingView
          v-else-if="view === 'ranking'"
          :rankings="rankings"
          :levels="q.levels.value"
          :loading="rankingsLoading"
          :error="rankingsError"
          @retry="refreshRankings"
        />

        <SettingsView v-else-if="view === 'settings'" />

        <NotFound v-else />
      </FadeTransition>
    </main>

    <LoginModal :open="promptOpen" @close="closeLogin" />
  </div>
</template>

<style scoped>
.shell {
  width: 100%;
}
.app {
  max-width: 30rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100dvh;
  overflow: hidden;
}
.app > :not(.top) {
  flex: 1 1 auto;
  min-height: 0;
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
.side {
  display: none;
}
.side-brand {
  border: none;
  background: transparent;
  padding: 0 0.75rem;
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
  color: var(--accent);
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
    padding: 1.5rem 1.5rem;
    width: 100%;
  }
}
</style>

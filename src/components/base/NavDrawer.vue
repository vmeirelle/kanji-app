<script setup lang="ts">
import AppBrand from './AppBrand.vue'
import KanjiBadge from './KanjiBadge.vue'

export type NavItem = { id: string; label: string; kanji: string }

defineProps<{ open: boolean; items: NavItem[]; active: string }>()
const emit = defineEmits<{ select: [id: string]; close: []; home: [] }>()
</script>

<template>
  <Transition name="drawer">
    <div v-if="open" class="wrap">
      <div class="backdrop" @click="emit('close')" />

      <aside class="panel">
        <div class="top">
          <button class="brand" aria-label="Home" @click="emit('home')">
            <AppBrand />
          </button>
        </div>

        <nav class="nav">
          <button
            v-for="(item, i) in items"
            :key="item.id"
            class="item"
            :class="{ active: item.id === active }"
            :style="{ '--i': i }"
            @click="emit('select', item.id)"
          >
            <KanjiBadge :char="item.kanji" round :size="1.8" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.wrap {
  position: fixed;
  inset: 0;
  z-index: 30;
}
@media (min-width: 48rem) {
  .wrap {
    display: none;
  }
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(20, 20, 22, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 74%;
  max-width: 16.5rem;
  padding: 1.4rem 1rem 1rem;

  background: var(--color-background-soft);
  border-right: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top {
  display: flex;
  align-items: center;
}
.brand {
  padding: 0 0.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.65rem;
  border: none;
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--color-text);
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s var(--ease-soft), color 0.2s var(--ease-soft);
}
.item:hover {
  background: var(--color-background-mute);
  color: var(--color-heading);
}
.item.active {
  background: var(--color-background-mute);
  color: var(--color-heading);
  font-weight: 600;
}
.item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 22%;
  bottom: 22%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--accent, var(--brand));
}

/* --- transição ------------------------------------------------------ */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.28s var(--ease-soft);
}
.drawer-enter-active .panel {
  transition: transform 0.34s var(--ease-ink);
}
.drawer-leave-active .panel {
  transition: transform 0.22s var(--ease-sharp);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .panel,
.drawer-leave-to .panel {
  transform: translateX(-100%);
}

/* Os itens entram em cascata depois do painel. */
.drawer-enter-active .item {
  animation: tile-in 0.34s var(--ease-spring) both;
  animation-delay: calc(0.12s + var(--i) * 55ms);
}
</style>

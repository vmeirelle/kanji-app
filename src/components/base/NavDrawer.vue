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
            v-for="item in items"
            :key="item.id"
            class="item"
            :class="{ active: item.id === active }"
            @click="emit('select', item.id)"
          >
            <KanjiBadge :char="item.kanji" round :size="1.7" />
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
  z-index: 20;
}

@media (min-width: 48rem) {
  .wrap {
    display: none;
  }
}
.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}
.panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 72%;
  max-width: 16rem;
  padding: 1.5rem 1rem;
  background: var(--color-background);
  border-right: 2px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.top {
  display: flex;
  align-items: center;
}
.brand {
  padding: 0 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
}
.nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.5rem;
  border: none;
  border-radius: 0.6rem;
  background: transparent;
  color: var(--color-heading);
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
}
.item:hover {
  background: var(--color-background-soft);
}
.item.active {
  background: var(--color-background-soft);
  color: var(--brand);
  font-weight: 600;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-active .panel,
.drawer-leave-active .panel {
  transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .panel,
.drawer-leave-to .panel {
  transform: translateX(-100%);
}
</style>

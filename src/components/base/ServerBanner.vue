<script setup lang="ts">
import { computed } from 'vue'
import { useServerStatus } from '../../composables/useServerStatus'

const { status, dismissed, check, dismiss } = useServerStatus()

const visible = computed(
  () => (status.value === 'offline' || status.value === 'checking') && !dismissed.value,
)
const checking = computed(() => status.value === 'checking')
</script>

<template>
  <Transition name="rise">
    <div v-if="visible" class="banner" role="status">
      <span class="dot" :class="{ pulse: checking }" />
      <p class="msg">Server's offline — keep learning, but progress isn't being saved right now.</p>
      <button class="act" :disabled="checking" @click="check">
        {{ checking ? 'Checking…' : 'Check again' }}
      </button>
      <button class="x" aria-label="Dismiss" @click="dismiss">✕</button>
    </div>
  </Transition>
</template>

<style scoped>
.banner {
  position: fixed;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: calc(100% - 2rem);
  padding: 0.6rem 0.75rem 0.6rem 0.9rem;
  border: 2px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
@media (min-width: 48rem) {
  .banner {
    left: calc(50% + var(--sidebar) / 2);
  }
}
.dot {
  flex: none;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: #e0a021;
}
.dot.pulse {
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}
.msg {
  font-size: 0.82rem;
  color: var(--color-heading);
  line-height: 1.25;
}
.act {
  flex: none;
  padding: 0.4rem 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.act:disabled {
  opacity: 0.6;
  cursor: default;
}
.x {
  flex: none;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.2rem;
}
.rise-enter-active,
.rise-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.rise-enter-from,
.rise-leave-to {
  opacity: 0;
  transform: translate(-50%, 1rem);
}
</style>

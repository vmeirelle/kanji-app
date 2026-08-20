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
      <p class="msg">You're offline — progress isn't being saved.</p>
      <button class="act" :disabled="checking" @click="check">
        {{ checking ? 'Checking…' : 'Retry' }}
      </button>
      <button class="x" aria-label="Dismiss" @click="dismiss">✕</button>
    </div>
  </Transition>
</template>

<style scoped>
.banner {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  z-index: 40;
  margin: 0 auto;
  width: fit-content;
  max-width: calc(100% - 1.5rem);
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.6rem 0.65rem 0.6rem 0.85rem;
  border: 2px solid var(--color-border);
  border-radius: 0.9rem;
  background: var(--color-background);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
.dot {
  flex: none;
  width: 0.55rem;
  height: 0.55rem;
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
  line-height: 1.25;
  color: var(--color-heading);
}
.act {
  flex: none;
  padding: 0.4rem 0.7rem;
  border: 2px solid var(--brand);
  border-radius: 0.7rem;
  background: var(--brand);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
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
  font-size: 0.85rem;
  line-height: 1;
  padding: 0.25rem;
  cursor: pointer;
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
  transform: translateY(0.75rem);
}
</style>

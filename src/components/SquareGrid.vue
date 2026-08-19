<script setup lang="ts">
export type GridItem = { key: string; label: string; state?: 'correct' | 'wrong' }

defineProps<{ items: GridItem[]; disabled?: boolean }>()
const emit = defineEmits<{ select: [key: string] }>()
</script>

<template>
  <div class="grid">
    <button
      v-for="item in items"
      :key="item.key"
      class="square"
      :class="item.state"
      :disabled="disabled"
      @click="emit('select', item.key)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr));
  gap: 0.75rem;
}
.square {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: 0.5rem;
  border: 2px solid var(--color-border);
  border-radius: 0.9rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: clamp(1.1rem, 5vw, 1.6rem);
  line-height: 1.2;
  text-align: center;
  cursor: pointer;
  transition: transform 0.08s, border-color 0.2s, background 0.2s;
}
.square:active:not(:disabled) {
  transform: scale(0.96);
}
.square:disabled {
  cursor: default;
}
.square.correct {
  border-color: #16a34a;
  background: #16a34a22;
  color: #16a34a;
}
.square.wrong {
  border-color: #dc2626;
  background: #dc262622;
  color: #dc2626;
}
@media (hover: hover) {
  .square:not(:disabled):hover {
    border-color: var(--color-border-hover);
  }
}
</style>

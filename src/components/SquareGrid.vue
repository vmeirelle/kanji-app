<script setup lang="ts">
export type GridItem = {
  key: string
  label: string
  state?: 'correct' | 'wrong'
  // When set (the wrong square you tapped), the square shows all three facets.
  detail?: { char: string; kana: string; meaning: string }
}

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
      <span v-if="item.detail" class="detail">
        <span class="d-char">{{ item.detail.char }}</span>
        <span class="d-sub">{{ item.detail.kana }}</span>
        <span class="d-sub">{{ item.detail.meaning }}</span>
      </span>
      <template v-else>{{ item.label }}</template>
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
  background: #dc2626;
  color: #fff;
}
.detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  line-height: 1.15;
}
.d-char {
  font-size: clamp(1.3rem, 6vw, 1.9rem);
}
.d-sub {
  font-size: clamp(0.7rem, 3vw, 0.85rem);
}
@media (hover: hover) {
  .square:not(:disabled):hover {
    border-color: var(--color-border-hover);
  }
}
</style>

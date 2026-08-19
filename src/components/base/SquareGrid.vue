<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { useTheme, Color } from '../../composables/useTheme'

type State = 'correct' | 'wrong'

export type GridItem = {
  key: string
  label: string
  state?: State
  detail?: { char: string; kana: string; meaning: string }
}

defineProps<{ items: GridItem[]; disabled?: boolean }>()
const emit = defineEmits<{ select: [key: string] }>()

const theme = useTheme()
const stateColors: Record<State, [Color, Color, Color]> = {
  correct: [Color.Correct, Color.CorrectSoft, Color.Correct],
  wrong: [Color.Wrong, Color.Wrong, Color.OnBrand],
}
function stateStyle(item: GridItem): CSSProperties {
  if (!item.state) return {}
  const [border, background, text] = stateColors[item.state]
  return { borderColor: theme.color(border), background: theme.color(background), color: theme.color(text) }
}
</script>

<template>
  <div class="grid">
    <button
      v-for="item in items"
      :key="item.key"
      class="square"
      :style="stateStyle(item)"
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

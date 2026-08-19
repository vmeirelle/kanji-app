<script setup lang="ts">
import { computed } from 'vue'
import SquareGrid, { type GridItem } from './SquareGrid.vue'
import type { Question } from '../quiz'

const props = defineProps<{
  prompt: string
  question: Question
  chosenKey: string | null
  disabled?: boolean
}>()
const emit = defineEmits<{ answer: [key: string] }>()

const items = computed<GridItem[]>(() =>
  props.question.options.map((o) => ({
    key: o.key,
    label: o.label,
    // Reveal only after a tap: correct square goes green, the wrong pick goes red.
    state: !props.chosenKey
      ? undefined
      : o.correct
        ? 'correct'
        : o.key === props.chosenKey
          ? 'wrong'
          : undefined,
  })),
)
</script>

<template>
  <div class="quiz">
    <div class="prompt">{{ prompt }}</div>
    <SquareGrid :items="items" :disabled="disabled" @select="emit('answer', $event)" />
  </div>
</template>

<style scoped>
.quiz {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.prompt {
  font-size: clamp(4rem, 22vw, 7rem);
  line-height: 1;
  text-align: center;
  color: var(--color-heading);
}
</style>

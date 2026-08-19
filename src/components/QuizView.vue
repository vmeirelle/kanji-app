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
  props.question.options.map((o) => {
    if (!props.chosenKey) return { key: o.key, label: o.label }
    if (o.correct) return { key: o.key, label: o.label, state: 'correct' }
    // The wrong square the user tapped expands to its three facets.
    if (o.key === props.chosenKey)
      return { key: o.key, label: o.label, state: 'wrong', detail: o.facets }
    return { key: o.key, label: o.label }
  }),
)
</script>

<template>
  <div class="quiz">
    <!-- Prompt card. The info block is always in flow (reserved) so revealing
         it never stretches the layout. -->
    <div class="card">
      <div class="glyph">{{ prompt }}</div>
      <dl class="info" :class="{ show: chosenKey }">
        <div><dt>English</dt><dd>{{ question.target.meaning }}</dd></div>
        <div><dt>Kana</dt><dd>{{ question.target.kana }}</dd></div>
        <div><dt>Kanji</dt><dd>{{ question.target.char }}</dd></div>
      </dl>
    </div>

    <SquareGrid :items="items" :disabled="disabled" @select="emit('answer', $event)" />
  </div>
</template>

<style scoped>
.quiz {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-background-soft);
}
.glyph {
  flex: 1;
  min-width: 0;
  font-size: clamp(4.5rem, 26vw, 8rem);
  line-height: 1;
  text-align: center;
  color: var(--color-heading);
  word-break: break-word;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  /* Reserved but hidden until answered — no reflow on reveal. */
  visibility: hidden;
}
.info.show {
  visibility: visible;
}
.info div {
  display: flex;
  flex-direction: column;
}
.info dt {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text);
}
.info dd {
  font-size: 1.1rem;
  color: var(--color-heading);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import SquareGrid, { type GridItem } from '../components/base/SquareGrid.vue'
import type { Question } from '../quiz'

const props = defineProps<{
  prompt: string
  question: Question
  chosenKey: string | null
  disabled?: boolean
}>()
const emit = defineEmits<{ answer: [key: string] }>()

// The back of the card carries the verdict: green when right, red when wrong.
const verdict = computed(() => {
  if (!props.chosenKey) return null
  return props.question.options.find((o) => o.key === props.chosenKey)?.correct ? 'ok' : 'no'
})

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
    <!-- Prompt card: the question on the front, the full kanji on the back.
         It flips on answering; both faces keep the same box, so nothing reflows. -->
    <div class="stage">
      <div class="card" :class="{ flipped: chosenKey }">
        <div class="face front">
          <div class="glyph">{{ prompt }}</div>
        </div>
        <div class="face back" :class="verdict">
          <div class="glyph small">{{ question.target.char }}</div>
          <dl class="info">
            <div><dt>Reading</dt><dd>{{ question.target.kana }}</dd></div>
            <div><dt>Meaning</dt><dd>{{ question.target.meaning }}</dd></div>
          </dl>
        </div>
      </div>
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
.stage {
  perspective: 1000px;
}
.card {
  position: relative;
  height: 11rem;
}
.face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-background-soft);
  backface-visibility: hidden;
  /* Each face turns on its own, and opacity hands over at the halfway point —
     so the flip holds up even where the browser flattens the 3D context. */
  transition:
    transform 0.28s ease-out,
    opacity 0s linear 0.14s;
}
.back {
  transform: rotateY(-180deg);
  opacity: 0;
}
.card.flipped .front {
  transform: rotateY(180deg);
  opacity: 0;
}
.card.flipped .back {
  transform: rotateY(0deg);
  opacity: 1;
}
.back.ok {
  border-color: #16a34a;
  background: #16a34a1f;
}
.back.ok .glyph,
.back.ok dd {
  color: #16a34a;
}
.back.no {
  border-color: #dc2626;
  background: #dc26261f;
}
.back.no .glyph,
.back.no dd {
  color: #dc2626;
}
.glyph {
  min-width: 0;
  font-size: clamp(4rem, 22vw, 6.5rem);
  line-height: 1;
  text-align: center;
  color: var(--color-heading);
  word-break: break-word;
}
.glyph.small {
  font-size: clamp(3rem, 16vw, 4.5rem);
}
.info {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.info div {
  display: flex;
  flex-direction: column;
}
@media (prefers-reduced-motion: reduce) {
  .face {
    transition: none;
  }
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

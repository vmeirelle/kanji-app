<script setup lang="ts">
import { computed } from 'vue'
import type { Quiz } from '../composables/useQuiz'
import QuizView from './QuizView.vue'
import BaseProgress from '../components/base/BaseProgress.vue'

const props = defineProps<{ quiz: Quiz }>()
const q = props.quiz

const progress = computed(() =>
  q.passTotal.value ? (q.position.value / q.passTotal.value) * 100 : 0,
)
</script>

<template>
  <section v-if="q.question.value" class="play">
    <div class="bar">
      <button class="stop" @click="q.restart">✕ Stop</button>
      <span>{{ q.position.value }}/{{ q.passTotal.value }}</span>
      <span class="tally">
        <span v-if="q.mode.value === 'ranked'" class="pts">★ {{ q.rankedScore.value }}</span>
        <span class="ok">✓ {{ q.correct.value }}</span>
        <span class="no">✗ {{ q.wrong.value }}</span>
      </span>
    </div>
    <BaseProgress class="progress" :value="progress" />
    <QuizView
      :prompt="q.question.value.prompt"
      :question="q.question.value"
      :chosen-key="q.chosenKey.value"
      :disabled="q.answered.value"
      :countdown="q.mode.value === 'ranked' ? q.secondsLeft.value : null"
      @answer="q.answer"
    />

    <div v-if="q.answered.value" class="tap-next" @click="q.next">
      <span class="tap-hint">Tap anywhere for next</span>
    </div>
  </section>
</template>

<style scoped>
.play {
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-hover) transparent;
}
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: var(--color-text);
}
.tally {
  display: flex;
  gap: 0.75rem;
}
.tally .pts {
  color: var(--accent);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.stop {
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.85rem;
  padding: 0.25rem 0.25rem 0.25rem 0;
  cursor: pointer;
}
.ok {
  color: var(--ok);
}
.no {
  color: var(--danger);
}
.progress {
  margin: 0.6rem 0 1.25rem;
}
.tap-next {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 1.5rem;
}
@media (min-width: 48rem) {
  .tap-next {
    left: var(--sidebar);
  }
}
.tap-hint {
  color: var(--color-text);
  font-size: 0.85rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
}
</style>

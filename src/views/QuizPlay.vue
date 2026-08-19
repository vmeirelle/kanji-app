<script setup lang="ts">
import { computed } from 'vue'
import { useQuiz } from '../composables/useQuiz'
import { levelColor } from '../data/blocks'
import QuizView from './QuizView.vue'
import BaseProgress from '../components/base/BaseProgress.vue'

const q = useQuiz()

const progress = computed(() =>
  q.passTotal.value ? (q.position.value / q.passTotal.value) * 100 : 0,
)

const accent = computed(() => levelColor(q.level.value))
const isRanked = computed(() => q.mode.value === 'ranked')

// 'meaning' é inglês; 'char' e 'kana' pedem a cadeia de fontes japonesa.
const promptJp = computed(() => q.from.value !== 'meaning')
const answerJp = computed(() => q.to.value !== 'meaning')
</script>

<template>
  <section v-if="q.question.value" class="play" :style="{ '--accent': accent, '--lv': accent }">
    <div class="bar">
      <button class="stop" aria-label="Stop round" @click="q.restart">
        <span class="stop-x">✕</span>
        <span class="stop-t">Stop</span>
      </button>

      <span class="pos">
        <strong>{{ q.position.value }}</strong>
        <span class="slash">/</span>
        <span>{{ q.passTotal.value }}</span>
      </span>

      <span class="tally">
        <span v-if="isRanked" class="chip pts">★ {{ q.rankedScore.value }}</span>
        <span class="chip ok">✓ {{ q.correct.value }}</span>
        <span class="chip no">✗ {{ q.wrong.value }}</span>
      </span>
    </div>

    <BaseProgress class="progress" :value="progress" :accent="accent" shimmer />

    <QuizView
      :prompt="q.question.value.prompt"
      :question="q.question.value"
      :chosen-key="q.chosenKey.value"
      :disabled="q.answered.value"
      :countdown="isRanked ? q.secondsLeft.value : null"
      :prompt-jp="promptJp"
      :answer-jp="answerJp"
      :streak="q.streak.value"
      :accent="accent"
      @answer="q.answer"
    />

    <Transition name="hint">
      <div v-if="q.answered.value" class="tap-next" @click="q.next">
        <span class="tap-hint">
          Tap anywhere to continue
          <span class="chev">›</span>
        </span>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.play {
  display: flex;
  flex-direction: column;
}

/* --- barra superior ---------------------------------------------- */
.bar {
  position: relative;
  z-index: 6; /* acima da camada de "tocar para continuar" */
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--color-text);
}

.stop {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem 0.3rem 0.4rem;
  border: 1.5px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s var(--ease-soft);
}
.stop:hover {
  border-color: var(--color-border);
  background: var(--color-background-soft);
  color: var(--danger);
}
.stop-x {
  font-size: 0.9rem;
  line-height: 1;
}

.pos {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.pos strong {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-heading);
}
.slash {
  margin: 0 0.1rem;
  opacity: 0.5;
}

.tally {
  display: flex;
  gap: 0.35rem;
}
.chip {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  font-size: 0.8rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}
.chip.pts {
  color: var(--accent, var(--brand));
  border-color: color-mix(in srgb, var(--accent, var(--brand)) 35%, transparent);
  background: color-mix(in srgb, var(--accent, var(--brand)) 10%, transparent);
}
.chip.ok {
  color: var(--ok);
}
.chip.no {
  color: var(--danger);
}

.progress {
  margin: 0.7rem 0 2rem;
}

/* --- camada de avanço --------------------------------------------- */
.tap-next {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 1.75rem;
  cursor: pointer;
}
@media (min-width: 48rem) {
  .tap-next {
    left: var(--sidebar);
  }
}
.tap-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
  font-size: 0.84rem;
}
.chev {
  font-size: 1.1rem;
  line-height: 1;
  color: var(--accent, var(--brand));
  animation: nudge 1.4s ease-in-out infinite;
}
@keyframes nudge {
  0%,
  100% {
    transform: translateX(0);
    opacity: 0.6;
  }
  50% {
    transform: translateX(4px);
    opacity: 1;
  }
}

.hint-enter-active {
  transition: opacity 0.3s var(--ease-soft) 0.35s;
}
.hint-enter-from {
  opacity: 0;
}
.hint-leave-active {
  transition: opacity 0.15s ease;
}
.hint-leave-to {
  opacity: 0;
}
</style>

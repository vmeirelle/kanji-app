<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useQuiz } from './useQuiz'
import SquareGrid, { type GridItem } from './components/SquareGrid.vue'
import QuizView from './components/QuizView.vue'
import FormatToggle from './components/FormatToggle.vue'

const q = useQuiz()
onMounted(q.start)

const blockItems = computed<GridItem[]>(() =>
  q.blocks.value.map((b) => ({ key: b.id, label: b.name })),
)
// Fill fraction for the progress bar (current question / pass size).
const progress = computed(() =>
  q.passTotal.value ? (q.position.value / q.passTotal.value) * 100 : 0,
)
</script>

<template>
  <main class="app">
    <h1 class="title">漢字</h1>

    <!-- Pick a block (the only setup tap) -->
    <section v-if="q.phase.value === 'block'">
      <p class="lead">Choose a block</p>
      <SquareGrid :items="blockItems" @select="q.selectBlock" />
    </section>

    <!-- Answer questions -->
    <section v-else-if="q.phase.value === 'question' && q.question.value">
      <div class="bar">
        <span>{{ q.position.value }}/{{ q.passTotal.value }}</span>
        <span class="tally">
          <span class="ok">✓ {{ q.correct.value }}</span>
          <span class="no">✗ {{ q.wrong.value }}</span>
        </span>
      </div>
      <div class="progress"><div class="fill" :style="{ width: progress + '%' }" /></div>
      <div class="toggles">
        <FormatToggle label="From" v-model="q.from.value" />
        <FormatToggle label="To" v-model="q.to.value" />
      </div>
      <QuizView
        :prompt="q.question.value.prompt"
        :question="q.question.value"
        :chosen-key="q.chosenKey.value"
        @answer="q.answer"
      />
    </section>

    <!-- End-of-pass popup -->
    <div v-else class="overlay">
      <div class="modal">
        <p class="lead">Block complete 🎉</p>
        <p class="summary">
          <span class="ok">✓ {{ q.correct.value }}</span>
          <span class="no">✗ {{ q.wrong.value }}</span>
        </p>
        <button
          v-if="q.incorrectCount.value"
          class="btn primary"
          @click="q.retryIncorrect"
        >
          Retry incorrect ({{ q.incorrectCount.value }})
        </button>
        <button class="btn" @click="q.restart">Finish</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.app {
  max-width: 30rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.title {
  font-size: 1.5rem;
  text-align: center;
  color: var(--color-heading);
}
.lead {
  text-align: center;
  font-size: 1.25rem;
  color: var(--color-heading);
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
.ok {
  color: #16a34a;
}
.no {
  color: #dc2626;
}
.progress {
  height: 0.5rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  overflow: hidden;
  margin: 0.6rem 0 1.25rem;
}
.fill {
  height: 100%;
  background: #16a34a;
  border-radius: 999px;
  transition: width 0.25s ease;
}
.toggles {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
}
.modal {
  width: 100%;
  max-width: 22rem;
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}
.summary {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 1.5rem;
}
.btn {
  padding: 0.85rem 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: 0.9rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 1rem;
  cursor: pointer;
}
.btn.primary {
  border-color: #16a34a;
  background: #16a34a;
  color: #fff;
}
</style>

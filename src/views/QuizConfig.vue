<script setup lang="ts">
import { computed } from 'vue'
import { useQuiz } from '../composables/useQuiz'
import { levelColor } from '../data/blocks'
import { FORMATS } from '../quiz'
import BaseSegment from '../components/base/BaseSegment.vue'
import MascotReaction from '../components/base/MascotReaction.vue'
import CategoryList from './CategoryList.vue'

const q = useQuiz()

const isRanked = computed(() => q.mode.value === 'ranked')

const modeOptions = [
  { value: 'custom', label: 'Custom' },
  { value: 'ranked', label: 'Ranked' },
]
const levelOptions = computed(() =>
  q.levels.value.map((l) => ({ value: l, label: l, accent: levelColor(l) })),
)
const sizeOptions = computed(() =>
  q.sizeOptions.value.map((n) => ({
    value: n,
    label: String(n),
    disabled: q.sizeLocked(n),
    title: q.sizeLocked(n) ? `Only ${q.poolSize.value} kanji at this level` : undefined,
  })),
)
const formatOptions = FORMATS.map((f) => ({ value: f.id, label: f.label }))
</script>

<template>
  <section class="pick" :style="{ '--lv': levelColor(q.level.value) }">
    <header class="today">
      <div class="today-text">
        <span class="jp" lang="ja">{{ isRanked ? '真剣勝負' : '今日の稽古' }}</span>
        <h1 class="title">{{ isRanked ? 'Ranked match' : "Today's practice" }}</h1>
        <p class="sub">
          {{
            isRanked
              ? '20 words · Kanji → Kana · 15s each'
              : `${q.roundSize.value} of ${q.poolSize.value} kanji selected`
          }}
        </p>
      </div>
      <MascotReaction class="mascot" :state="isRanked ? 'thinking' : 'idle'" :size="5.2" />
    </header>

    <div class="card">
      <span class="tag">Game</span>
      <BaseSegment
        :options="modeOptions"
        :model-value="q.mode.value"
        @update:model-value="q.setMode($event as 'custom' | 'ranked')"
      />

      <span class="tag">Japanese level</span>
      <BaseSegment
        :options="levelOptions"
        :model-value="q.level.value"
        @update:model-value="q.setLevel($event)"
      />

      <div class="head">
        <span class="tag">Kanji per round</span>
        <span class="sub-n">{{ q.roundSize.value }} of {{ q.poolSize.value }}</span>
      </div>
      <BaseSegment
        :options="sizeOptions"
        :model-value="q.activeSize.value"
        :disabled="isRanked"
        @update:model-value="q.size.value = $event"
      />

      <div class="duo">
        <div class="col">
          <span class="tag">Show</span>
          <BaseSegment :options="formatOptions" :disabled="isRanked" v-model="q.from.value" />
        </div>
        <span class="arrow" aria-hidden="true">→</span>
        <div class="col">
          <span class="tag">Answer</span>
          <BaseSegment :options="formatOptions" :disabled="isRanked" v-model="q.to.value" />
        </div>
      </div>
    </div>

    <CategoryList
      :blocks="q.levelBlocks.value"
      v-model:selected="q.selected.value"
      :disabled="isRanked"
    />

    <button class="start" :disabled="!q.poolSize.value" @click="q.startPass">
      <span class="start-label">{{ isRanked ? 'Start ranked' : 'Start practice' }}</span>
      <span class="start-n">{{ q.roundSize.value }} kanji</span>
    </button>
  </section>
</template>

<style scoped>
.pick {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  flex: 1;
}

/* --- cabeçalho ------------------------------------------------------ */
.today {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}
.today-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.jp {
  font-family: var(--font-kanji);
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  color: var(--lv, var(--brand));
}
.title {
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}
.sub {
  margin-top: 0.15rem;
  font-size: 0.78rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.mascot {
  margin-bottom: -0.35rem;
}

/* --- painel de opções ------------------------------------------------ */
.card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.tag {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--color-text);
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.sub-n {
  font-size: 0.74rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.duo {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 0.5rem;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}
.arrow {
  padding-bottom: 0.7rem;
  font-size: 1rem;
  color: var(--color-text);
  opacity: 0.6;
}

/* --- botão de início -------------------------------------------------- */
.start {
  position: relative;
  overflow: hidden;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.95rem 1.25rem;

  border: none;
  border-radius: var(--r-lg);
  background: linear-gradient(
    135deg,
    var(--lv, var(--brand)),
    color-mix(in srgb, var(--lv, var(--brand)) 68%, #000)
  );
  color: #fff;
  font-size: 1.02rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: transform 0.2s var(--ease-spring), box-shadow 0.25s var(--ease-soft), opacity 0.2s;
}
.start::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
  animation: shimmer 3.4s var(--ease-soft) infinite;
}
.start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.start:active:not(:disabled) {
  transform: translateY(0) scale(0.99);
}
.start:disabled {
  opacity: 0.45;
  cursor: default;
  box-shadow: none;
}
.start:disabled::after {
  display: none;
}
.start-label {
  font-weight: 600;
}
.start-n {
  padding: 0.12rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  font-size: 0.78rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>

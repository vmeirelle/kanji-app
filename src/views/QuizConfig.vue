<script setup lang="ts">
import { computed } from 'vue'
import { useQuiz } from '../composables/useQuiz'
import { levelColor } from '../data/blocks'
import { FORMATS } from '../quiz'
import BaseSegment from '../components/base/BaseSegment.vue'
import CategoryList from './CategoryList.vue'

const q = useQuiz()

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
        <span class="sub">{{ q.roundSize.value }} of {{ q.poolSize.value }} selected</span>
      </div>
      <BaseSegment
        :options="sizeOptions"
        :model-value="q.activeSize.value"
        :disabled="q.mode.value === 'ranked'"
        @update:model-value="q.size.value = $event"
      />

      <div class="duo">
        <div class="col">
          <span class="tag">Show (From)</span>
          <BaseSegment :options="formatOptions" :disabled="q.mode.value === 'ranked'" v-model="q.from.value" />
        </div>
        <div class="col">
          <span class="tag">Answer (To)</span>
          <BaseSegment :options="formatOptions" :disabled="q.mode.value === 'ranked'" v-model="q.to.value" />
        </div>
      </div>
    </div>

    <CategoryList
      :blocks="q.levelBlocks.value"
      v-model:selected="q.selected.value"
      :disabled="q.mode.value === 'ranked'"
    />

    <button class="btn primary" :disabled="!q.poolSize.value" @click="q.startPass">
      {{ q.mode.value === 'ranked' ? `Start ranked · ${q.roundSize.value} words` : `Start · ${q.roundSize.value} kanji` }}
    </button>
  </section>
</template>

<style scoped>
.pick {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
}
.pick > .btn.primary {
  margin-top: auto;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  min-width: 0;
}
.tag {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.sub {
  font-size: 0.75rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
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
.btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.btn.primary {
  border-color: var(--lv, var(--brand));
  background: var(--lv, var(--brand));
  color: #fff;
}
</style>

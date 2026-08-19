<script setup lang="ts">
import { computed } from 'vue'
import { useQuiz } from '../composables/useQuiz'
import { levelColor } from '../data/blocks'
import { FORMATS, type Format } from '../quiz'
import BaseSegment from '../components/base/BaseSegment.vue'
import PageHeader from '../components/base/PageHeader.vue'
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

// Show and Answer can't be the same format — picking a match swaps them.
function setFrom(v: Format) {
  if (v === q.to.value) q.to.value = q.from.value
  q.from.value = v
}
function setTo(v: Format) {
  if (v === q.from.value) q.from.value = q.to.value
  q.to.value = v
}

// Ranked locks the config; show it regardless of leftover custom state.
const shownSelected = computed(() =>
  q.mode.value === 'ranked' ? q.levelBlocks.value.map((b) => b.id) : q.selected.value,
)
</script>

<template>
  <section class="pick" :style="{ '--lv': levelColor(q.level.value) }">
    <PageHeader jp="今日の稽古" title="Today's practice" image="/reading.png" />

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
        <span class="sub">{{ q.roundSize.value }} of {{ q.poolSize.value }}</span>
      </div>
      <BaseSegment
        :options="sizeOptions"
        :model-value="q.mode.value === 'ranked' ? q.roundSize.value : q.activeSize.value"
        :disabled="q.mode.value === 'ranked'"
        @update:model-value="q.size.value = $event"
      />

      <div class="duo">
        <div class="col">
          <span class="tag">Show (From)</span>
          <BaseSegment
            :options="formatOptions"
            :model-value="q.mode.value === 'ranked' ? 'char' : q.from.value"
            :disabled="q.mode.value === 'ranked'"
            @update:model-value="setFrom($event as Format)"
          />
        </div>
        <div class="col">
          <span class="tag">Answer (To)</span>
          <BaseSegment
            :options="formatOptions"
            :model-value="q.mode.value === 'ranked' ? 'kana' : q.to.value"
            :disabled="q.mode.value === 'ranked'"
            @update:model-value="setTo($event as Format)"
          />
        </div>
      </div>
    </div>

    <div class="cats">
      <CategoryList
        :blocks="q.levelBlocks.value"
        :selected="shownSelected"
        :disabled="q.mode.value === 'ranked'"
        @update:selected="q.selected.value = $event"
      />
    </div>

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
  min-height: 0;
}
/* Only the category grid scrolls; header, config and the Start button stay put.
   scrollbar-gutter keeps the gutter reserved so tiles never shift when the
   scrollbar comes and goes. */
.cats {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scroll-behavior: smooth;
  /* Equal padding both sides + both-edges gutter = symmetric tiles with room
     between them and the scrollbar. */
  padding: 0 0.5rem;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--lv, var(--brand)) 40%, transparent) transparent;
}
.cats::-webkit-scrollbar {
  width: 0.9rem;
}
.cats::-webkit-scrollbar-track {
  background: transparent;
}
.cats::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--lv, var(--brand)) 40%, transparent);
  border-radius: 999px;
  /* wide transparent border = thin, floating pill with space around it */
  border: 0.3rem solid transparent;
  background-clip: padding-box;
  transition: background 0.2s;
}
.cats::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--lv, var(--brand)) 70%, transparent);
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

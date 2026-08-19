<script setup lang="ts">
import { computed } from 'vue'
import { blocksIn, levelColor, levelsOf, type Block } from '../data/blocks'

const props = defineProps<{ blocks: Block[]; selected: string[]; disabled?: boolean }>()
const emit = defineEmits<{ 'update:selected': [string[]] }>()

const groups = computed(() =>
  levelsOf(props.blocks).map((level) => ({ level, blocks: blocksIn(props.blocks, [level]) })),
)
const has = (id: string) => props.selected.includes(id)
const countOn = (blocks: Block[]) => blocks.filter((b) => has(b.id)).length

function toggle(id: string) {
  if (props.disabled) return
  emit(
    'update:selected',
    has(id) ? props.selected.filter((x) => x !== id) : [...props.selected, id],
  )
}

function toggleGroup(blocks: Block[]) {
  if (props.disabled) return
  const ids = blocks.map((b) => b.id)
  emit(
    'update:selected',
    ids.every(has)
      ? props.selected.filter((x) => !ids.includes(x))
      : [...new Set([...props.selected, ...ids])],
  )
}
</script>

<template>
  <div class="groups" :class="{ locked: disabled }">
    <section
      v-for="g in groups"
      :key="g.level"
      class="group"
      :style="{ '--lv': levelColor(g.level) }"
    >
      <div class="head">
        <span class="lv">{{ g.level }}</span>
        <span class="count">{{ countOn(g.blocks) }}/{{ g.blocks.length }} categories</span>
        <button v-if="!disabled" class="all" @click="toggleGroup(g.blocks)">
          {{ g.blocks.every((b) => has(b.id)) ? 'None' : 'All' }}
        </button>
      </div>

      <div class="grid">
        <button
          v-for="b in g.blocks"
          :key="b.id"
          type="button"
          class="tile"
          :class="{ on: has(b.id) }"
          :disabled="disabled"
          :aria-pressed="has(b.id)"
          @click="toggle(b.id)"
        >
          <span class="name">{{ b.name }}</span>
          <span class="n">{{ b.kanji.length }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding-bottom: 0.5rem;
}
.lv {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--lv);
}
.count {
  flex: 1;
  font-size: 0.75rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.all {
  border: none;
  background: transparent;
  font-size: 0.8rem;
  color: var(--lv);
  cursor: pointer;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
  gap: 0.5rem;
}
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  aspect-ratio: 1;
  padding: 0.4rem;
  border: 2px solid var(--color-border);
  border-radius: 0.8rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
  transition: transform 0.08s, border-color 0.15s, background 0.15s, color 0.15s;
}
.tile:active {
  transform: scale(0.96);
}
.tile:disabled {
  cursor: default;
}
.tile:disabled:active {
  transform: none;
}
.name {
  font-size: 0.75rem;
  line-height: 1.15;
  text-align: center;
  
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}
.n {
  font-size: 0.65rem;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}
.tile.on {
  border-color: var(--lv);
  background: var(--lv);
  color: #fff;
}
@media (hover: hover) {
  .tile:hover:not(.on) {
    border-color: var(--lv);
  }
}
</style>

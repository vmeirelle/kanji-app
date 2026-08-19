<script setup lang="ts">
import { computed } from 'vue'
import { byLevel, type Block } from '../data/blocks'

const props = defineProps<{ blocks: Block[]; selected: string[] }>()
const emit = defineEmits<{ 'update:selected': [string[]] }>()

const groups = computed(() => byLevel(props.blocks))
const has = (id: string) => props.selected.includes(id)

function toggle(id: string) {
  emit(
    'update:selected',
    has(id) ? props.selected.filter((x) => x !== id) : [...props.selected, id],
  )
}

/** Tapping the level header takes all of it, or drops all of it. */
function toggleLevel(ids: string[]) {
  emit(
    'update:selected',
    ids.every(has)
      ? props.selected.filter((x) => !ids.includes(x))
      : [...new Set([...props.selected, ...ids])],
  )
}
</script>

<template>
  <div class="levels">
    <section v-for="g in groups" :key="g.level" class="level">
      <button class="head" @click="toggleLevel(g.blocks.map((b) => b.id))">
        <span class="tag">{{ g.level }}</span>
        <span class="all">{{ g.blocks.every((b) => has(b.id)) ? 'None' : 'All' }}</span>
      </button>
      <label v-for="b in g.blocks" :key="b.id" class="row" :class="{ on: has(b.id) }">
        <input type="checkbox" :checked="has(b.id)" @change="toggle(b.id)" />
        <span class="name">{{ b.name }}</span>
        <span class="count">{{ b.kanji.length }}</span>
      </label>
    </section>
  </div>
</template>

<style scoped>
.levels {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.level {
  display: flex;
  flex-direction: column;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.25rem 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
}
.tag {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-heading);
}
.all {
  font-size: 0.8rem;
  color: #16a34a;
}
.row {
  display: grid;
  grid-template-columns: 1.25rem 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 0.25rem;
  border-top: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
}
.row.on .name {
  color: var(--color-heading);
  font-weight: 600;
}
input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #16a34a;
}
.count {
  font-size: 0.85rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
</style>

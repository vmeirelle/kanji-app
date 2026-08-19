<script setup lang="ts">
import { levelColor, type Block } from '../data/blocks'

const props = defineProps<{ blocks: Block[]; selected: string[] }>()
const emit = defineEmits<{ 'update:selected': [string[]] }>()

const has = (id: string) => props.selected.includes(id)

function toggle(id: string) {
  emit(
    'update:selected',
    has(id) ? props.selected.filter((x) => x !== id) : [...props.selected, id],
  )
}

function toggleAll() {
  const ids = props.blocks.map((b) => b.id)
  emit('update:selected', ids.every(has) ? [] : ids)
}
</script>

<template>
  <div class="list">
    <div class="head">
      <span class="tag">Categories</span>
      <button class="all" @click="toggleAll">
        {{ blocks.every((b) => has(b.id)) ? 'None' : 'All' }}
      </button>
    </div>
    <label
      v-for="b in blocks"
      :key="b.id"
      class="row"
      :class="{ on: has(b.id) }"
      :style="{ '--lv': levelColor(b.level) }"
    >
      <input type="checkbox" :checked="has(b.id)" @change="toggle(b.id)" />
      <span class="name"><span class="lv">{{ b.level }}</span>{{ b.name }}</span>
      <span class="count">{{ b.kanji.length }}</span>
    </label>
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.25rem 0.5rem;
}
.tag {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
}
.all {
  border: none;
  background: transparent;
  font-size: 0.8rem;
  color: var(--brand);
  cursor: pointer;
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
.lv {
  display: inline-block;
  min-width: 2rem;
  margin-right: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--lv);
}
.row.on .name {
  color: var(--color-heading);
  font-weight: 600;
}
input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--lv);
}
.count {
  font-size: 0.85rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
</style>

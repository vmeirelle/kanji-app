<script setup lang="ts">
import { computed } from 'vue'
import { today, type Ranking } from '../rankings'

const props = defineProps<{ rankings: Ranking[] }>()

type DayGroup = { day: string; entries: Ranking[] }
type BlockGroup = { blockId: string; blockName: string; days: DayGroup[] }

const dayOf = (r: Ranking) => r.day ?? r.date.slice(0, 10) // fallback for old entries

// Group into block → day → scores (best first), newest day first.
const groups = computed<BlockGroup[]>(() => {
  const blocks = new Map<string, BlockGroup>()
  for (const r of props.rankings) {
    let block = blocks.get(r.blockId)
    if (!block) {
      block = { blockId: r.blockId, blockName: r.blockName, days: [] }
      blocks.set(r.blockId, block)
    }
    let day = block.days.find((d) => d.day === dayOf(r))
    if (!day) {
      day = { day: dayOf(r), entries: [] }
      block.days.push(day)
    }
    day.entries.push(r)
  }
  for (const block of blocks.values()) {
    block.days.sort((a, b) => b.day.localeCompare(a.day))
    for (const day of block.days) day.entries.sort((a, b) => b.pct - a.pct)
  }
  return [...blocks.values()].sort((a, b) => a.blockName.localeCompare(b.blockName))
})

const todayStr = today()
const dayLabel = (day: string) => (day === todayStr ? 'Today' : day)
</script>

<template>
  <section>
    <p v-if="!rankings.length" class="empty">No scores yet — finish a block to rank.</p>

    <div v-for="block in groups" :key="block.blockId" class="block">
      <h2 class="block-name">{{ block.blockName }}</h2>
      <div v-for="d in block.days" :key="d.day" class="day">
        <h3 class="day-name">{{ dayLabel(d.day) }}</h3>
        <ol class="list">
          <li v-for="(r, i) in d.entries" :key="i" class="row">
            <span class="rank">{{ i + 1 }}</span>
            <span class="name">{{ r.name }}</span>
            <span class="pct">{{ r.pct }}%</span>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.empty {
  text-align: center;
  color: var(--color-text);
  padding: 2rem 0;
}
.block {
  margin-bottom: 1.5rem;
}
.block-name {
  font-size: 1.15rem;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}
.day {
  margin-bottom: 0.75rem;
}
.day-name {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
  margin-bottom: 0.4rem;
}
.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.row {
  display: grid;
  grid-template-columns: 1.5rem 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
}
.rank {
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.name {
  color: var(--color-heading);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pct {
  color: var(--brand);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { today, addDays, points, type Ranking } from '../rankings'

const props = defineProps<{ rankings: Ranking[] }>()

type BlockGroup = { blockId: string; blockName: string; entries: Ranking[] }

const day = ref(today()) // the day currently shown; swipe up/down to change
const dayOf = (r: Ranking) => r.day ?? r.date.slice(0, 10) // fallback for old entries

// Blocks (with ranked scores) for the selected day only.
const blocks = computed<BlockGroup[]>(() => {
  const map = new Map<string, BlockGroup>()
  for (const r of props.rankings) {
    if (dayOf(r) !== day.value) continue
    let g = map.get(r.blockId)
    if (!g) {
      g = { blockId: r.blockId, blockName: r.blockName, entries: [] }
      map.set(r.blockId, g)
    }
    g.entries.push(r)
  }
  for (const g of map.values()) g.entries.sort((a, b) => points(b) - points(a))
  return [...map.values()].sort((a, b) => a.blockName.localeCompare(b.blockName))
})

// Can't go to a future day; older days are always reachable.
const canNewer = computed(() => day.value < today())
const older = () => (day.value = addDays(day.value, -1))
const newer = () => canNewer.value && (day.value = addDays(day.value, 1))

const dayLabel = computed(() => {
  if (day.value === today()) return 'Today'
  if (day.value === addDays(today(), -1)) return 'Yesterday'
  return day.value
})

// Vertical swipe: up → newer day, down → older day.
let startY = 0
const onStart = (e: TouchEvent) => (startY = e.changedTouches[0]!.clientY)
const onEnd = (e: TouchEvent) => {
  const dy = e.changedTouches[0]!.clientY - startY
  if (Math.abs(dy) < 40) return
  if (dy < 0) newer()
  else older()
}
</script>

<template>
  <section class="rank" @touchstart.passive="onStart" @touchend="onEnd">
    <div class="daynav">
      <button class="chev" :disabled="!canNewer" aria-label="Newer day" @click="newer">▲</button>
      <span class="daylabel">{{ dayLabel }}</span>
      <button class="chev" aria-label="Older day" @click="older">▼</button>
    </div>

    <p v-if="!blocks.length" class="empty">No scores on this day.</p>

    <div v-for="block in blocks" :key="block.blockId" class="block">
      <h2 class="block-name">{{ block.blockName }}</h2>
      <ol class="list">
        <li v-for="(r, i) in block.entries" :key="i" class="row">
          <span class="pos">{{ i + 1 }}</span>
          <span class="name">{{ r.name }}</span>
          <span class="xy">{{ r.correct }}/{{ r.total }}</span>
          <span class="pts">{{ points(r) }} pts</span>
        </li>
      </ol>
    </div>

    <p class="hint">Swipe up/down to change day</p>
  </section>
</template>

<style scoped>
.rank {
  min-height: 60vh;
}
.daynav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.chev {
  border: 2px solid var(--color-border);
  border-radius: 0.6rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.9rem;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
}
.chev:disabled {
  opacity: 0.35;
  cursor: default;
}
.daylabel {
  min-width: 6.5rem;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-heading);
}
.empty {
  text-align: center;
  color: var(--color-text);
  padding: 2rem 0;
}
.block {
  margin-bottom: 1.5rem;
}
.block-name {
  font-size: 1.05rem;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}
.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.row {
  display: grid;
  grid-template-columns: 1.5rem 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
}
.pos {
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
.xy {
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.pts {
  color: var(--brand);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.hint {
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text);
  margin-top: 0.5rem;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { today, addDays, points, type Ranking } from '../rankings'

const props = defineProps<{ rankings: Ranking[] }>()

type BlockGroup = { blockId: string; blockName: string; entries: Ranking[] }

const day = ref(today()) // the day currently shown; ‹ › or swipe to change
const category = ref('') // '' = all categories
const quantity = ref('') // '' = any kanji count
const dayOf = (r: Ranking) => r.day ?? r.date.slice(0, 10) // fallback for old entries

// Category options: every distinct selection that has a score.
const categories = computed(() =>
  [...new Set(props.rankings.map((r) => r.blockName))].sort((a, b) => a.localeCompare(b)),
)
// Quantity options: every distinct kanji count that has a score.
const quantities = computed(() =>
  [...new Set(props.rankings.map((r) => r.total))].sort((a, b) => a - b),
)

// Blocks (with ranked scores) for the selected day, narrowed by both filters.
const blocks = computed<BlockGroup[]>(() => {
  const map = new Map<string, BlockGroup>()
  for (const r of props.rankings) {
    if (dayOf(r) !== day.value) continue
    if (category.value && r.blockName !== category.value) continue
    if (quantity.value && String(r.total) !== quantity.value) continue
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

// Kanji quantity of the run(s) in a group (a range if players used different sizes).
const qtyLabel = (g: BlockGroup) => {
  const totals = [...new Set(g.entries.map((e) => e.total))].sort((a, b) => a - b)
  const lo = totals[0]
  const hi = totals[totals.length - 1]
  return lo === hi ? `${lo} kanji` : `${lo}–${hi} kanji`
}

// Can't go to a future day; older days are always reachable.
const canNewer = computed(() => day.value < today())
const older = () => (day.value = addDays(day.value, -1))
const newer = () => canNewer.value && (day.value = addDays(day.value, 1))

const dayLabel = computed(() => {
  if (day.value === today()) return 'Today'
  if (day.value === addDays(today(), -1)) return 'Yesterday'
  return day.value
})

// Horizontal swipe: right → older day (‹), left → newer day (›).
let startX = 0
const onStart = (e: TouchEvent) => (startX = e.changedTouches[0]!.clientX)
const onEnd = (e: TouchEvent) => {
  const dx = e.changedTouches[0]!.clientX - startX
  if (Math.abs(dx) < 40) return
  if (dx > 0) older()
  else newer()
}
</script>

<template>
  <section class="rank" @touchstart.passive="onStart" @touchend="onEnd">
    <div class="daynav">
      <button class="chev" aria-label="Previous day" @click="older">‹</button>
      <span class="daylabel">{{ dayLabel }}</span>
      <button class="chev" :disabled="!canNewer" aria-label="Next day" @click="newer">›</button>
    </div>

    <label class="filter">
      <span>Category</span>
      <select v-model="category" class="sel">
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </label>

    <label class="filter">
      <span>Quantity</span>
      <select v-model="quantity" class="sel">
        <option value="">Any quantity</option>
        <option v-for="n in quantities" :key="n" :value="String(n)">{{ n }} kanji</option>
      </select>
    </label>

    <p v-if="!blocks.length" class="empty">No scores on this day.</p>

    <div v-for="block in blocks" :key="block.blockId" class="block">
      <h2 class="block-name">
        {{ block.blockName }} <span class="qty">· {{ qtyLabel(block) }}</span>
      </h2>
      <ol class="list">
        <li v-for="(r, i) in block.entries" :key="i" class="row">
          <span class="pos">{{ i + 1 }}</span>
          <span class="name">{{ r.name }}</span>
          <span class="xy">{{ r.correct }}/{{ r.total }}</span>
          <span class="pts">{{ points(r) }} pts</span>
        </li>
      </ol>
    </div>
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
  border: none;
  background: transparent;
  color: var(--color-heading);
  font-size: 1.5rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
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
.filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  font-size: 0.85rem;
  color: var(--color-text);
}
.sel {
  flex: 1;
  max-width: 16rem;
  padding: 0.5rem 0.6rem;
  border: 2px solid var(--color-border);
  border-radius: 0.6rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.9rem;
  cursor: pointer;
}
.sel:focus {
  outline: none;
  border-color: var(--brand);
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
.qty {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--color-text);
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

</style>

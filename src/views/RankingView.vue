<script setup lang="ts">
import { ref, computed } from 'vue'
import { today, addDays, points, type Ranking } from '../rankings'
import { levelColor } from '../data/blocks'
import EmptyState from '../components/base/EmptyState.vue'
import BaseSegment from '../components/base/BaseSegment.vue'
import FadeTransition from '../components/base/FadeTransition.vue'
import PageHeader from '../components/base/PageHeader.vue'

const props = defineProps<{
  rankings: Ranking[]
  levels: string[]
  loading?: boolean
  error?: boolean
}>()
defineEmits<{ retry: [] }>()

type LevelGroup = { level: string; entries: Ranking[] }

const day = ref(today())
const level = ref('')

const filterOptions = computed(() => [
  { value: '', label: 'All' },
  ...props.levels.map((l) => ({ value: l, label: l, accent: levelColor(l) })),
])
const isToday = computed(() => day.value === today())
const dayOf = (r: Ranking) => r.day ?? r.date.slice(0, 10)

const groups = computed<LevelGroup[]>(() => {
  const map = new Map<string, LevelGroup>()
  for (const r of props.rankings) {
    if (dayOf(r) !== day.value) continue
    if (level.value && r.level !== level.value) continue
    let g = map.get(r.level)
    if (!g) {
      g = { level: r.level, entries: [] }
      map.set(r.level, g)
    }
    g.entries.push(r)
  }
  for (const g of map.values()) g.entries.sort((a, b) => points(b) - points(a))
  return [...map.values()].sort((a, b) => a.level.localeCompare(b.level))
})

const canNewer = computed(() => day.value < today())
const older = () => (day.value = addDays(day.value, -1))
const newer = () => canNewer.value && (day.value = addDays(day.value, 1))

const dayLabel = computed(() => {
  if (day.value === today()) return 'Today'
  if (day.value === addDays(today(), -1)) return 'Yesterday'
  return day.value
})

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
    <PageHeader jp="番付" title="Ranking" image="/happy.png" />

    <div class="daynav">
      <button class="chev" aria-label="Previous day" @click="older">‹</button>
      <span class="daylabel">{{ dayLabel }}</span>
      <button class="chev" :disabled="!canNewer" aria-label="Next day" @click="newer">›</button>
    </div>

    <BaseSegment class="filter-seg" :options="filterOptions" v-model="level" />

    <div v-if="loading" class="state">
      <span class="spinner" aria-label="Loading rankings" />
    </div>

    <EmptyState v-else-if="error" src="/lost.png">
      Couldn't load the ranking — the server may be waking up.
      <button class="retry" @click="$emit('retry')">Try again</button>
    </EmptyState>

    <div v-else class="scroll">
      <FadeTransition>
        <div class="results" :key="day + '|' + level">
        <EmptyState v-if="!groups.length" src="/lost.png">
          No scores on this day.<template v-if="isToday"> Play a ranked round to put a name up here.</template>
        </EmptyState>

        <div
          v-for="g in groups"
          :key="g.level"
          class="block"
          :style="{ '--lv': levelColor(g.level) }"
        >
          <div class="block-name">
            <span class="lv">{{ g.level }}</span>
            <span class="cnt">{{ g.entries.length }}</span>
          </div>
          <div class="list">
            <li v-for="(r, i) in g.entries" :key="i" class="row">
              <span class="pos">{{ i + 1 }}</span>
              <span class="name">{{ r.name }}</span>
              <span class="xy">{{ r.correct }}/{{ r.total }}</span>
              <span class="pts">{{ points(r) }} pts</span>
            </li>
          </div>
        </div>
      </div>
      </FadeTransition>
    </div>
  </section>
</template>

<style scoped>
.rank {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spinner {
  width: 2.25rem;
  height: 2.25rem;
  border: 3px solid var(--color-border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.retry {
  display: block;
  margin: 0.75rem auto 0;
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 0.9rem;
  cursor: pointer;
}
.daynav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.25rem;
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
.filter-seg {
  margin-bottom: 1.25rem;
}
.block {
  margin-bottom: 1.5rem;
}
.block-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.85rem;
  margin-bottom: 0.6rem;
  border-radius: 0.6rem;
  background: var(--lv, var(--color-heading));
}
.lv {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #fff;
}
.cnt {
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
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
  color: var(--accent);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>

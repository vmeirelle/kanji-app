<script setup lang="ts">
import { ref, computed } from 'vue'
import { today, addDays, points, type Ranking } from '../rankings'
import { levelColor } from '../data/blocks'
import EmptyState from '../components/base/EmptyState.vue'
import BaseSegment from '../components/base/BaseSegment.vue'

const props = defineProps<{ rankings: Ranking[]; levels: string[] }>()

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

const MEDALS = ['🥇', '🥈', '🥉']

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
      <button class="chev" aria-label="Previous day" @click="older">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <span :key="day" class="daylabel">{{ dayLabel }}</span>
      <button class="chev" :disabled="!canNewer" aria-label="Next day" @click="newer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>

    <BaseSegment class="filter-seg" :options="filterOptions" v-model="level" />

    <EmptyState v-if="!groups.length" src="/lost.png">
      No scores on this day.<template v-if="isToday">
        Play a ranked round to put a name up here.</template
      >
    </EmptyState>

    <div v-for="g in groups" :key="g.level" class="block" :style="{ '--lv': levelColor(g.level) }">
      <div class="block-name">
        <span class="lv">{{ g.level }}</span>
        <span class="cnt">{{ g.entries.length }}</span>
      </div>

      <ol class="list">
        <li
          v-for="(r, i) in g.entries"
          :key="`${r.date}-${i}`"
          class="row"
          :class="{ podium: i < 3 }"
          :style="{ '--i': i }"
        >
          <span class="pos">{{ MEDALS[i] ?? i + 1 }}</span>
          <span class="name">{{ r.name }}</span>
          <span class="xy">{{ r.correct }}/{{ r.total }}</span>
          <span class="pts">{{ points(r) }}<em>pts</em></span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.rank {
  min-height: 60vh;
}

/* --- navegação por dia ------------------------------------------------ */
.daynav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.chev {
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s var(--ease-soft);
}
.chev svg {
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: var(--color-heading);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.chev:hover:not(:disabled) {
  border-color: var(--color-border);
  background: var(--color-background-soft);
}
.chev:disabled {
  opacity: 0.3;
  cursor: default;
}
.daylabel {
  min-width: 7rem;
  text-align: center;
  font-size: 1.08rem;
  font-weight: 600;
  color: var(--color-heading);
  animation: view-in 0.3s var(--ease-soft) both;
}

.filter-seg {
  margin-bottom: 1.4rem;
}

/* --- bloco por nível --------------------------------------------------- */
.block {
  margin-bottom: 1.6rem;
}
.block-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.9rem;
  margin-bottom: 0.65rem;
  border-radius: var(--r-sm);
  background: linear-gradient(120deg, var(--lv), color-mix(in srgb, var(--lv) 68%, #000));
  box-shadow: var(--shadow-sm);
}
.lv {
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #fff;
}
.cnt {
  font-size: 0.78rem;
  font-weight: 600;
  color: #fff;
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
}

/* --- linhas ------------------------------------------------------------ */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.row {
  position: relative;
  display: grid;
  grid-template-columns: 1.7rem 1fr auto auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.8rem;

  border: 1.5px solid var(--color-border);
  border-radius: var(--r-md);
  background: var(--color-background-soft);
  box-shadow: var(--shadow-sm);

  animation: tile-in 0.4s var(--ease-spring) both;
  animation-delay: calc(var(--i) * 45ms);
  transition: transform 0.2s var(--ease-spring), box-shadow 0.2s var(--ease-soft);
}
@media (hover: hover) {
  .row:hover {
    transform: translateX(3px);
    box-shadow: var(--shadow-md);
  }
}

/* Pódio ganha um trilho na cor do nível. */
.row.podium {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--lv) 9%, var(--color-background-soft)),
    var(--color-background-soft) 55%
  );
}
.row.podium::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18%;
  bottom: 18%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--lv);
}

.pos {
  text-align: center;
  color: var(--color-text);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}
.row.podium .pos {
  font-size: 1.05rem;
}
.name {
  color: var(--color-heading);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xy {
  font-size: 0.85rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.pts {
  display: inline-flex;
  align-items: baseline;
  gap: 0.2rem;
  color: var(--lv);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.pts em {
  font-size: 0.66rem;
  font-style: normal;
  font-weight: 600;
  opacity: 0.7;
}
</style>

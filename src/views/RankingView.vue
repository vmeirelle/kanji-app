<script setup lang="ts">
import { ref, computed } from 'vue'
import { today, addDays, points, type Ranking } from '../rankings'
import { levelColor } from '../data/blocks'
import EmptyState from '../components/base/EmptyState.vue'

const props = defineProps<{ rankings: Ranking[]; levels: string[] }>()

type LevelGroup = { level: string; entries: Ranking[] }

const day = ref(today())
const level = ref('')
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
    <div class="daynav">
      <button class="chev" aria-label="Previous day" @click="older">‹</button>
      <span class="daylabel">{{ dayLabel }}</span>
      <button class="chev" :disabled="!canNewer" aria-label="Next day" @click="newer">›</button>
    </div>

    <div class="seg">
      <button type="button" class="seg-btn" :class="{ on: level === '' }" @click="level = ''">
        All
      </button>
      <button
        v-for="l in props.levels"
        :key="l"
        type="button"
        class="seg-btn"
        :class="{ on: level === l }"
        :style="{ '--lv': levelColor(l) }"
        @click="level = l"
      >
        {{ l }}
      </button>
    </div>

    <EmptyState v-if="!groups.length" src="/lost.png">
      No scores on this day.<template v-if="isToday"> Play a ranked round to put a name up here.</template>
    </EmptyState>

    <div v-for="g in groups" :key="g.level" class="block" :style="{ '--lv': levelColor(g.level) }">
      <h2 class="block-name"><span class="lv">{{ g.level }}</span></h2>
      <ol class="list">
        <li v-for="(r, i) in g.entries" :key="i" class="row">
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
.seg {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  border: 2px solid var(--color-border);
  border-radius: 0.8rem;
  overflow: hidden;
  background: var(--color-background);
  margin-bottom: 1.25rem;
}
.seg-btn {
  padding: 0.5rem 0.25rem;
  border: none;
  border-left: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.seg-btn:first-child {
  border-left: none;
}
.seg-btn:hover:not(.on) {
  background: var(--color-background-mute);
}
.seg-btn.on {
  background: var(--lv, var(--brand));
  color: #fff;
}
.block {
  margin-bottom: 1.5rem;
}
.block-name {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}
.lv {
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--lv, var(--color-heading));
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

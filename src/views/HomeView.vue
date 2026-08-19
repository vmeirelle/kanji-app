<script setup lang="ts">
import { levelColor } from '../data/blocks'
import PageHeader from '../components/base/PageHeader.vue'

const emit = defineEmits<{ go: [id: string] }>()

// Mockup content — static placeholders, no real data yet.
const news = [
  { tag: 'New', title: 'Basics mode is here', body: 'Drill hiragana & katakana row by row.', when: 'Today' },
  { tag: 'Soon', title: 'Vocabulary & phrases', body: 'Words you master turn into sentences.', when: 'Coming' },
  { tag: 'Update', title: 'Ranked scoring', body: 'Beat the 10s clock — seconds become points.', when: 'Recent' },
]

const progress = [
  { id: 'learn', title: 'Kanji', sub: 'N5 · 12 / 79 learned', accent: levelColor('N5'), bars: [30, 45, 40, 60, 55, 72, 68] },
  { id: 'basics', title: 'Kana', sub: 'Hiragana 40 / 46', accent: levelColor('N2'), bars: [50, 62, 58, 70, 80, 78, 88] },
  { id: 'vocab', title: 'Reading', sub: '0 phrases · soon', accent: levelColor('N4'), bars: [8, 12, 10, 16, 14, 20, 18] },
  { id: 'ranking', title: 'Ranking', sub: 'Best 87 pts', accent: levelColor('N1'), bars: [40, 55, 48, 65, 60, 74, 90] },
]

// Kanji completion per JLPT level (mock).
const kanjiLevels = [
  { level: 'N5', done: 47, total: 79 },
  { level: 'N4', done: 22, total: 166 },
  { level: 'N3', done: 8, total: 367 },
  { level: 'N2', done: 0, total: 367 },
  { level: 'N1', done: 0, total: 1232 },
]
const pct = (d: number, t: number) => Math.round((d / t) * 100)

// Daily streak activity — 5 weeks of intensity 0..4 (mock, deterministic).
const streakCount = 12
const days = Array.from({ length: 35 }, (_, i) => (i * 3 + 2) % 5)
</script>

<template>
  <section class="home">
    <PageHeader jp="ホーム" title="Home" image="/happy.png" />

    <div class="scroll">
      <div class="block">
        <span class="tag">News</span>
        <div class="news">
          <article v-for="n in news" :key="n.title" class="news-card">
            <span class="pill">{{ n.tag }}</span>
            <div class="news-body">
              <h3 class="news-title">{{ n.title }}</h3>
              <p class="news-text">{{ n.body }}</p>
            </div>
            <span class="when">{{ n.when }}</span>
          </article>
        </div>
      </div>


      <div class="block">
        <span class="tag">Kanji completion</span>
        <div class="levels">
          <div
            v-for="l in kanjiLevels"
            :key="l.level"
            class="lrow"
            :style="{ '--lv': levelColor(l.level) }"
          >
            <span class="lname">{{ l.level }}</span>
            <div class="ltrack">
              <div class="lfill" :style="{ width: pct(l.done, l.total) + '%' }" />
            </div>
            <span class="lval">{{ l.done }}/{{ l.total }}</span>
          </div>
        </div>
      </div>

      <div class="block">
        <span class="tag">Your progress</span>
        <div class="grid">
          <button
            v-for="p in progress"
            :key="p.id"
            class="pcard"
            :style="{ '--lv': p.accent }"
            @click="emit('go', p.id)"
          >
            <div class="pcard-head">
              <span class="ptitle">{{ p.title }}</span>
              <span class="psub">{{ p.sub }}</span>
            </div>
            <!-- Placeholder chart — bars indicate where the graph will go. -->
            <div class="chart" aria-hidden="true">
              <span v-for="(h, i) in p.bars" :key="i" class="bar" :style="{ height: h + '%' }" />
            </div>
            <span class="chart-note">Sample · chart coming soon</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.scroll {
  --page: var(--lv-N3);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--page) 25%, transparent) transparent;
}
.scroll::-webkit-scrollbar {
  width: 1.2rem;
}
.scroll::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--page) 25%, transparent);
  border-radius: 999px;
  border: 0.45rem solid transparent;
  background-clip: padding-box;
}
.scroll::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--page) 50%, transparent);
}
.block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.tag {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
}

.row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.streak {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-heading);
}
.heat {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.3rem;
}
.cell {
  aspect-ratio: 1;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--lv-N4) calc(var(--v) * 100%), var(--color-background-mute));
}

.levels {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.lrow {
  display: grid;
  grid-template-columns: 2rem 1fr auto;
  align-items: center;
  gap: 0.6rem;
}
.lname {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--lv);
}
.ltrack {
  height: 0.5rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  overflow: hidden;
}
.lfill {
  height: 100%;
  border-radius: 999px;
  background: var(--lv);
}
.lval {
  font-size: 0.72rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.news {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.news-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border: 2px solid var(--color-border);
  border-radius: 0.9rem;
  background: var(--color-background-soft);
}
.pill {
  flex: none;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
  background: var(--lv-N3);
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}
.news-body {
  flex: 1;
  min-width: 0;
}
.news-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-heading);
}
.news-text {
  font-size: 0.82rem;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.when {
  flex: none;
  font-size: 0.72rem;
  color: var(--color-text);
  opacity: 0.7;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: 0.75rem;
}
.pcard {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: left;
  padding: 0.85rem;
  border: 2px solid color-mix(in srgb, var(--lv) 35%, var(--color-border));
  border-radius: 1rem;
  background: color-mix(in srgb, var(--lv) 8%, var(--color-background));
  cursor: pointer;
}
.pcard-head {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.ptitle {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-heading);
}
.psub {
  font-size: 0.75rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.chart {
  display: flex;
  align-items: flex-end;
  gap: 0.25rem;
  height: 3.2rem;
  padding: 0.3rem 0.1rem 0;
  border-bottom: 1px solid var(--color-border);
}
.bar {
  flex: 1;
  min-height: 6%;
  border-radius: 0.2rem 0.2rem 0 0;
  background: var(--lv);
  opacity: 0.55;
}
.chart-note {
  font-size: 0.65rem;
  color: var(--color-text);
  opacity: 0.6;
}
</style>

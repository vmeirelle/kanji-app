<script setup lang="ts">
import type { SavedLesson } from '../saved'
import BaseProgress from '../components/base/BaseProgress.vue'
import EmptyState from '../components/base/EmptyState.vue'

defineProps<{ lessons: SavedLesson[] }>()
const emit = defineEmits<{ resume: [id: string]; drop: [id: string] }>()

const answered = (l: SavedLesson) => l.passTotal - l.queue.length
const pct = (l: SavedLesson) => (l.passTotal ? (answered(l) / l.passTotal) * 100 : 0)
const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
</script>

<template>
  <div class="saved">
    <EmptyState v-if="!lessons.length" src="/peace.png">
      Nothing paused. Stop a round mid-way and it waits for you here.
    </EmptyState>

    <template v-else>
      <header class="head">
        <h1 class="title">Unfinished</h1>
        <span class="count">{{ lessons.length }} paused</span>
      </header>

      <ul class="list">
        <li v-for="(l, i) in lessons" :key="l.id" class="lesson" :style="{ '--i': i }">
          <div class="info">
            <span class="label">{{ l.label }}</span>
            <span class="meta">
              <strong>{{ answered(l) }}/{{ l.passTotal }}</strong> answered · {{ when(l.date) }}
            </span>
            <BaseProgress class="bar" :value="pct(l)" :height="0.28" />
          </div>

          <button class="resume" @click="emit('resume', l.id)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
            Resume
          </button>

          <button class="drop" :aria-label="`Discard ${l.label}`" @click="emit('drop', l.id)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.7rem;
  margin-bottom: 0.9rem;
  border-bottom: 1px solid var(--color-border);
}
.title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}
.count {
  font-size: 0.78rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.lesson {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem;

  border: 1.5px solid var(--color-border);
  border-radius: var(--r-lg);
  background: var(--color-background-soft);
  box-shadow: var(--shadow-sm);

  animation: tile-in 0.42s var(--ease-spring) both;
  animation-delay: calc(var(--i) * 55ms);
  transition: transform 0.2s var(--ease-spring), box-shadow 0.25s var(--ease-soft);
}
.lesson::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--brand);
  opacity: 0.55;
}
@media (hover: hover) {
  .lesson:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
}
.label {
  font-weight: 600;
  color: var(--color-heading);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta {
  font-size: 0.74rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.meta strong {
  color: var(--color-heading);
  font-weight: 600;
}
.bar {
  margin-top: 0.15rem;
}

.resume {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex: none;
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: var(--r-sm);
  background: var(--brand);
  color: #fff;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform 0.18s var(--ease-spring), box-shadow 0.2s var(--ease-soft);
}
.resume svg {
  width: 0.85rem;
  height: 0.85rem;
  fill: currentColor;
}
.resume:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.resume:active {
  transform: scale(0.96);
}

.drop {
  display: grid;
  place-items: center;
  flex: none;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s var(--ease-soft);
}
.drop svg {
  width: 0.85rem;
  height: 0.85rem;
  fill: none;
  stroke: var(--color-text);
  stroke-width: 2;
  stroke-linecap: round;
  transition: stroke 0.2s var(--ease-soft);
}
.drop:hover {
  background: var(--danger-soft);
}
.drop:hover svg {
  stroke: var(--danger);
}
</style>

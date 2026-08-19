<script setup lang="ts">
import type { SavedLesson } from '../saved'

defineProps<{ lessons: SavedLesson[] }>()
const emit = defineEmits<{ resume: [id: string]; drop: [id: string] }>()

const answered = (l: SavedLesson) => l.passTotal - l.queue.length
const when = (iso: string) => new Date(iso).toLocaleString()
</script>

<template>
  <section>
    <p v-if="!lessons.length" class="empty">
      Nothing paused. Stop a round mid-way and it waits for you here.
    </p>

    <ul v-else class="list">
      <li v-for="l in lessons" :key="l.id" class="row">
        <div class="info">
          <span class="label">{{ l.label }}</span>
          <span class="meta">{{ answered(l) }}/{{ l.passTotal }} answered · {{ when(l.date) }}</span>
          <div class="progress">
            <div class="fill" :style="{ width: (answered(l) / l.passTotal) * 100 + '%' }" />
          </div>
        </div>
        <button class="btn" @click="emit('resume', l.id)">Resume</button>
        <button class="drop" aria-label="Delete" @click="emit('drop', l.id)">✕</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.empty {
  text-align: center;
  color: var(--color-text);
  padding: 2rem 0;
}
.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 2px solid var(--color-border);
  border-radius: 0.9rem;
  background: var(--color-background-soft);
}
.info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}
.label {
  color: var(--color-heading);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta {
  font-size: 0.75rem;
  color: var(--color-text);
}
.progress {
  height: 0.3rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  overflow: hidden;
}
.fill {
  height: 100%;
  background: var(--brand);
  border-radius: 999px;
}
.btn {
  padding: 0.5rem 0.8rem;
  border: 2px solid var(--brand);
  border-radius: 0.6rem;
  background: var(--brand);
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
}
.drop {
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
}
</style>

<script setup lang="ts">
import type { Ranking } from '../rankings'

defineProps<{ rankings: Ranking[] }>()
</script>

<template>
  <section>
    <p v-if="!rankings.length" class="empty">No scores yet — finish a block to rank.</p>
    <ol v-else class="list">
      <li v-for="(r, i) in rankings" :key="i" class="row">
        <span class="rank">{{ i + 1 }}</span>
        <span class="name">{{ r.name }}</span>
        <span class="block">{{ r.blockName }}</span>
        <span class="pct">{{ r.pct }}%</span>
      </li>
    </ol>
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
  gap: 0.5rem;
}
.row {
  display: grid;
  grid-template-columns: 1.5rem 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
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
.block {
  color: var(--color-text);
  font-size: 0.85rem;
}
.pct {
  color: #16a34a;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>

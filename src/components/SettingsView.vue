<script setup lang="ts">
import { computed } from 'vue'
import { FORMATS, type Format } from '../quiz'
import SelectRow from './SelectRow.vue'

const props = defineProps<{ from: Format; to: Format; level: string; levels: string[] }>()
const emit = defineEmits<{
  'update:from': [Format]
  'update:to': [Format]
  'update:level': [string]
}>()

const levelOptions = computed(() => props.levels.map((l) => ({ id: l, label: `${l} kanji` })))
</script>

<template>
  <section class="settings">
    <h2 class="group">Difficulty</h2>
    <SelectRow
      label="JLPT level"
      :options="levelOptions"
      :model-value="level"
      @update:model-value="emit('update:level', $event)"
    />
    <p class="note">Changing the level resets your category picks and ends the current round.</p>

    <h2 class="group">Quiz format</h2>
    <SelectRow
      label="Show (From)"
      :options="FORMATS"
      :model-value="from"
      @update:model-value="emit('update:from', $event as Format)"
    />
    <SelectRow
      label="Answer (To)"
      :options="FORMATS"
      :model-value="to"
      @update:model-value="emit('update:to', $event as Format)"
    />
  </section>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
}
.group {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
  margin: 1.25rem 0 0.25rem;
}
.group:first-child {
  margin-top: 0;
}
.note {
  font-size: 0.8rem;
  color: var(--color-text);
  padding: 0.5rem 0.25rem 0;
}
</style>

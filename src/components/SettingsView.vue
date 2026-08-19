<script setup lang="ts">
import { FORMATS, type Format } from '../quiz'
import SelectRow from './SelectRow.vue'

defineProps<{ from: Format; to: Format }>()
const emit = defineEmits<{ 'update:from': [Format]; 'update:to': [Format] }>()
</script>

<template>
  <section class="settings">
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
</style>

<script setup lang="ts">
import type { Format } from '../quiz'
import FormatToggle from './FormatToggle.vue'

defineProps<{ from: Format; to: Format }>()
const emit = defineEmits<{ 'update:from': [Format]; 'update:to': [Format] }>()
</script>

<template>
  <section class="settings">
    <h2 class="group">Quiz format</h2>
    <FormatToggle
      label="Show (From)"
      :model-value="from"
      @update:model-value="emit('update:from', $event)"
    />
    <FormatToggle
      label="Answer (To)"
      :model-value="to"
      @update:model-value="emit('update:to', $event)"
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
  margin-bottom: 0.25rem;
}
</style>

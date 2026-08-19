<script setup lang="ts">
import { FORMATS, type Format } from '../quiz'

defineProps<{ label: string; modelValue: Format }>()
const emit = defineEmits<{ 'update:modelValue': [Format] }>()
</script>

<template>
  <label class="row">
    <span class="lbl">{{ label }}</span>
    <select
      class="sel"
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as Format)"
    >
      <option v-for="f in FORMATS" :key="f.id" :value="f.id">{{ f.label }}</option>
    </select>
  </label>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0.25rem;
  border-bottom: 1px solid var(--color-border);
}
.lbl {
  color: var(--color-heading);
  font-size: 1rem;
}
.sel {
  padding: 0.5rem 0.6rem;
  border: 2px solid var(--color-border);
  border-radius: 0.6rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 1rem;
  cursor: pointer;
}
.sel:focus {
  outline: none;
  border-color: var(--brand);
}
</style>

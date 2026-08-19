<script setup lang="ts">
import { FORMATS, type Format } from '../quiz'

defineProps<{ label: string; modelValue: Format }>()
const emit = defineEmits<{ 'update:modelValue': [Format] }>()
</script>

<template>
  <label class="toggle">
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
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--color-text);
}
.sel {
  padding: 0.15rem 0.3rem;
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  background: transparent;
  color: var(--color-heading);
  font-size: 0.8rem;
  cursor: pointer;
}
.sel:focus {
  outline: none;
  border-bottom-color: #16a34a;
}
</style>

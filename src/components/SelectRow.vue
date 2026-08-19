<script setup lang="ts">
/** One settings row: a label and a native select. */
defineProps<{ label: string; options: { id: string; label: string }[]; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <label class="row">
    <span class="lbl">{{ label }}</span>
    <select
      class="sel"
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="o in options" :key="o.id" :value="o.id">{{ o.label }}</option>
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

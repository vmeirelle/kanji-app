<script setup lang="ts">
import { FORMATS, type Format } from '../quiz'

defineProps<{ label: string; modelValue: Format }>()
const emit = defineEmits<{ 'update:modelValue': [Format] }>()
</script>

<template>
  <div class="toggle">
    <span class="lbl">{{ label }}</span>
    <div class="opts">
      <button
        v-for="f in FORMATS"
        :key="f.id"
        class="opt"
        :class="{ active: f.id === modelValue }"
        @click="emit('update:modelValue', f.id)"
      >
        {{ f.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.lbl {
  width: 2.75rem;
  font-size: 0.85rem;
  color: var(--color-text);
}
.opts {
  display: flex;
  flex: 1;
  gap: 0.25rem;
}
.opt {
  flex: 1;
  padding: 0.4rem 0.25rem;
  border: 2px solid var(--color-border);
  border-radius: 0.6rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
}
.opt.active {
  border-color: #16a34a;
  background: #16a34a;
  color: #fff;
}
</style>

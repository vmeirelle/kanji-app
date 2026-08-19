<script setup lang="ts" generic="T extends string | number">
export type SegOption<V extends string | number> = {
  value: V
  label: string
  disabled?: boolean
  title?: string
  accent?: string
}

const props = defineProps<{
  options: SegOption<T>[]
  modelValue: T
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [T] }>()

function select(o: SegOption<T>) {
  if (props.disabled || o.disabled || o.value === props.modelValue) return
  emit('update:modelValue', o.value)
}
</script>

<template>
  <div class="seg">
    <button
      v-for="o in options"
      :key="String(o.value)"
      type="button"
      class="seg-btn"
      :class="{ on: o.value === modelValue }"
      :style="o.accent ? { '--lv': o.accent } : undefined"
      :disabled="disabled || o.disabled"
      :aria-pressed="o.value === modelValue"
      :title="o.title"
      @click="select(o)"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  border: 2px solid var(--color-border);
  border-radius: 0.8rem;
  overflow: hidden;
  background: var(--color-background);
}
.seg-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.05rem;
  padding: 0.5rem 0.25rem;
  border: none;
  border-left: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  font-size: 0.95rem;
  line-height: 1.2;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease;
}
.seg-btn:first-child {
  border-left: none;
}
.seg-btn:hover:not(:disabled):not(.on) {
  background: var(--color-background-mute);
}
.seg-btn.on {
  background: var(--lv, var(--brand));
  color: #fff;
}
.seg-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.seg-btn.on:disabled {
  opacity: 1;
  cursor: default;
  background: var(--color-background-mute);
  color: var(--color-text);
}
</style>

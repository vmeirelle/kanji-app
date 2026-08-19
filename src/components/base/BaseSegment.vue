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
  <div class="seg" :class="{ off: disabled }">
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
      <span class="fill" aria-hidden="true" />
      <span class="txt">{{ o.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  padding: 3px;
  gap: 2px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--r-md);
  background: var(--color-background);
  box-shadow: inset 0 1px 3px rgba(30, 44, 77, 0.06);
  transition: opacity 0.25s var(--ease-soft);
}
.seg.off {
  opacity: 0.6;
}

.seg-btn {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.25rem;
  border: none;
  border-radius: calc(var(--r-md) - 4px);
  background: transparent;
  color: var(--color-text);
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: color 0.25s var(--ease-soft), transform 0.18s var(--ease-spring);
}

/* Preenchimento que cresce do centro em vez de trocar de cor de estalo. */
.fill {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: var(--lv, var(--brand));
  opacity: 0;
  transform: scale(0.72);
  transition: transform 0.3s var(--ease-spring), opacity 0.22s var(--ease-soft);
}
.txt {
  position: relative;
}

.seg-btn:hover:not(:disabled):not(.on) {
  color: var(--color-heading);
}
.seg-btn:hover:not(:disabled):not(.on) .fill {
  opacity: 0.1;
  transform: scale(1);
}
.seg-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.seg-btn.on {
  color: #fff;
  font-weight: 600;
}
.seg-btn.on .fill {
  opacity: 1;
  transform: scale(1);
  box-shadow: var(--shadow-sm);
}

.seg-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
/* Selecionado mas travado: mantém legível, perde a cor de destaque. */
.seg-btn.on:disabled {
  opacity: 1;
  cursor: default;
  color: var(--color-heading);
}
.seg-btn.on:disabled .fill {
  background: var(--color-background-mute);
  box-shadow: none;
}
</style>

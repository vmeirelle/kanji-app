<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { useTheme, Color } from '../../composables/useTheme'

const props = withDefaults(
  defineProps<{
    value: number
    height?: number
    /** Cor de preenchimento; por padrão a cor da marca. */
    accent?: string
    /** Passa um brilho correndo sobre a parte preenchida. */
    shimmer?: boolean
  }>(),
  { height: 0.5, shimmer: false },
)

const theme = useTheme()

const trackStyle = computed<CSSProperties>(() => ({
  height: `${props.height}rem`,
  background: theme.color(Color.Muted),
}))

const fillStyle = computed<CSSProperties>(() => {
  const c = props.accent ?? theme.color(Color.Brand)
  return {
    width: `${Math.max(0, Math.min(100, props.value))}%`,
    background: `linear-gradient(90deg, color-mix(in srgb, ${c} 62%, transparent), ${c})`,
  }
})
</script>

<template>
  <div class="track" :style="trackStyle">
    <div class="fill" :style="fillStyle">
      <span v-if="shimmer" class="gleam" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.track {
  position: relative;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(20, 20, 22, 0.09);
}
.fill {
  position: relative;
  height: 100%;
  border-radius: 999px;
  overflow: hidden;
  transition: width 0.45s var(--ease-spring), background 0.4s var(--ease-soft);
}
.gleam {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 35%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  animation: shimmer 2.4s var(--ease-soft) infinite;
}
</style>

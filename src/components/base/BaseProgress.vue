<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { useTheme, Color } from '../../composables/useTheme'

const props = withDefaults(
  defineProps<{ value: number; height?: number; color?: string }>(),
  { height: 0.5 },
)
const theme = useTheme()
const trackStyle = computed<CSSProperties>(() => ({
  height: `${props.height}rem`,
  background: theme.color(Color.Muted),
}))
const fillStyle = computed<CSSProperties>(() => ({
  width: `${props.value}%`,
  background: props.color ?? theme.color(Color.Brand),
}))
</script>

<template>
  <div class="track" :style="trackStyle">
    <div class="fill" :style="fillStyle" />
  </div>
</template>

<style scoped>
.track {
  border-radius: 999px;
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
}
</style>

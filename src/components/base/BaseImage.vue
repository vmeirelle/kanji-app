<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

// Constrain by width OR height (in rem) — the other stays auto so the image
// scales proportionally without distortion. `size` is a width shorthand.
const props = withDefaults(
  defineProps<{ src: string; alt?: string; width?: number; height?: number; size?: number }>(),
  { alt: '' },
)
const style = computed<CSSProperties>(() => {
  const w = props.width ?? props.size
  return {
    width: w != null ? `${w}rem` : undefined,
    height: props.height != null ? `${props.height}rem` : undefined,
  }
})
</script>

<template>
  <img class="base-image" :src="src" :alt="alt" :style="style" />
</template>

<style scoped>
.base-image {
  display: block;
  max-width: 100%;
  object-fit: contain;
}
</style>

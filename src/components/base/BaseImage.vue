<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

const props = withDefaults(
  defineProps<{ src: string; alt?: string; size?: number }>(),
  { alt: '', size: 8 },
)
const style = computed<CSSProperties>(() => ({ width: `${props.size}rem` }))
</script>

<template>
  <img class="base-image" :src="src" :alt="alt" :style="style" />
</template>

<style scoped>
.base-image {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>

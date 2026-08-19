<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { useTheme, Color } from '../../composables/useTheme'

const theme = useTheme()
const style = computed<CSSProperties>(() => ({
  background: theme.color(Color.Surface),
  borderColor: theme.color(Color.Border),
}))
</script>

<template>
  <div class="base-card" :style="style"><slot /></div>
</template>

<style scoped>
.base-card {
  padding: 0.85rem;
  border-width: 2px;
  border-style: solid;
  border-radius: 0.9rem;
}
</style>

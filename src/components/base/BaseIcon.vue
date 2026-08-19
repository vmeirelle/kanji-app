<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { useTheme, Size, Color } from '../../composables/useTheme'

const props = withDefaults(
  defineProps<{ size?: Size; color?: Color }>(),
  { size: Size.Md, color: Color.Heading },
)

const theme = useTheme()
const style = computed<CSSProperties>(() => ({
  fontSize: theme.fontSize(props.size),
  color: theme.color(props.color),
}))
</script>

<template>
  <span class="base-icon" :style="style"><slot /></span>
</template>

<style scoped>
.base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  user-select: none;
}
</style>

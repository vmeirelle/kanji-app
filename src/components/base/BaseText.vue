<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { useTheme, Size, Color, Align } from '../../composables/useTheme'

const props = withDefaults(
  defineProps<{
    size?: Size
    color?: Color
    bold?: boolean
    align?: Align
    caps?: boolean // uppercase label style (the section tags)
    truncate?: boolean // single line with ellipsis
  }>(),
  { size: Size.Md, color: Color.Text, align: Align.Start },
)

const theme = useTheme()
const style = computed<CSSProperties>(() => ({
  fontSize: theme.fontSize(props.size),
  color: theme.color(props.color),
  fontWeight: props.bold ? 600 : 400,
  textAlign: theme.textAlign(props.align),
  textTransform: props.caps ? 'uppercase' : undefined,
  letterSpacing: props.caps ? '0.05em' : undefined,
}))
</script>

<template>
  <span class="base-text" :class="{ truncate }" :style="style"><slot /></span>
</template>

<style scoped>
.base-text {
  display: block;
  line-height: 1.4;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

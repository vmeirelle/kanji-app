<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { useTheme, Direction, Align, Space } from '../../composables/useTheme'

const props = withDefaults(
  defineProps<{
    direction?: Direction
    gap?: Space
    align?: Align // alignItems
    justify?: Align // justifyContent
    grow?: boolean // take remaining space and allow shrinking (min-width: 0)
  }>(),
  { direction: Direction.Col },
)

const theme = useTheme()
const style = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: props.direction === Direction.Row ? 'row' : 'column',
  gap: props.gap ? theme.space(props.gap) : undefined,
  alignItems: props.align ? theme.flexAlign(props.align) : undefined,
  justifyContent: props.justify ? theme.flexAlign(props.justify) : undefined,
  flex: props.grow ? '1' : undefined,
  minWidth: props.grow ? 0 : undefined,
}))
</script>

<template>
  <div class="base-stack" :style="style"><slot /></div>
</template>

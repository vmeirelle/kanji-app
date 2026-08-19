<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { useTheme, Size, Color, Variant } from '../../composables/useTheme'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    block?: boolean
    disabled?: boolean
  }>(),
  { variant: Variant.Plain, size: Size.Md },
)
const emit = defineEmits<{ click: [] }>()

const theme = useTheme()

const palette: Record<Variant, [Color, Color, Color]> = {
  [Variant.Primary]: [Color.Brand, Color.Brand, Color.OnBrand],
  [Variant.Plain]: [Color.Surface, Color.Border, Color.Heading],
  [Variant.Ghost]: [Color.Background, Color.Background, Color.Text],
}

const style = computed<CSSProperties>(() => {
  const md = props.size === Size.Md
  const [bg, border, text] = palette[props.variant]
  return {
    padding: md ? '0.85rem 1.25rem' : '0.5rem 0.8rem',
    borderRadius: md ? '0.9rem' : '0.6rem',
    fontSize: theme.fontSize(props.size),
    width: props.block ? '100%' : undefined,
    opacity: props.disabled ? 0.5 : 1,
    cursor: props.disabled ? 'default' : 'pointer',
    borderWidth: '2px',
    borderStyle: 'solid',
    background: props.variant === Variant.Ghost ? 'transparent' : theme.color(bg),
    borderColor: props.variant === Variant.Ghost ? 'transparent' : theme.color(border),
    color: theme.color(text),
  }
})
</script>

<template>
  <button class="base-button" :style="style" :disabled="disabled" @click="emit('click')">
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  line-height: 1;
}
</style>

<script setup lang="ts">
/**
 * Enso — o círculo de pincel do logo, virado em componente de progresso.
 *
 * Usado como cronômetro do modo ranked (drenando) e como progresso do round
 * (pintando). A irregularidade da borda vem de um feTurbulence +
 * feDisplacementMap aplicado ao traço, o que dá a aparência de tinta em papel
 * em vez de um anel de SVG perfeito.
 */
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 0–100. Quanto do círculo está pintado. */
    value?: number
    /** Diâmetro em rem. */
    size?: number
    color?: string
    trackColor?: string
    strokeWidth?: number
    /** Pulsa, para os segundos finais. */
    urgent?: boolean
    /** Anima o traço se desenhando na montagem. */
    draw?: boolean
  }>(),
  {
    value: 100,
    size: 4,
    color: 'var(--brand)',
    trackColor: 'var(--color-border)',
    strokeWidth: 5,
    urgent: false,
    draw: false,
  },
)

// Arco de 340° (o enso tradicional não fecha), começando no topo.
const PATH = 'M 57.29 8.64 A 42 42 0 1 1 42.71 8.64'
const LEN = 249.2

const uid = useId()
const filterId = computed(() => `enso-rough-${uid}`)

const clamped = computed(() => Math.min(100, Math.max(0, props.value)))
const offset = computed(() => LEN * (1 - clamped.value / 100))
</script>

<template>
  <svg
    class="enso"
    :class="{ urgent, draw }"
    viewBox="0 0 100 100"
    :style="{
      width: `${size}rem`,
      height: `${size}rem`,
      '--enso-len': LEN,
      '--enso-offset': offset,
    }"
    aria-hidden="true"
  >
    <defs>
      <filter :id="filterId" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>

    <path
      class="track"
      :d="PATH"
      :stroke="trackColor"
      :stroke-width="strokeWidth"
      fill="none"
      stroke-linecap="round"
      :filter="`url(#${filterId})`"
    />
    <path
      class="ink"
      :d="PATH"
      :stroke="color"
      :stroke-width="strokeWidth"
      fill="none"
      stroke-linecap="round"
      :stroke-dasharray="LEN"
      :stroke-dashoffset="offset"
      :filter="`url(#${filterId})`"
    />
  </svg>
</template>

<style scoped>
.enso {
  display: block;
  overflow: visible;
}
.ink {
  transition: stroke-dashoffset 0.12s linear, stroke 0.4s var(--ease-soft);
}
.enso.draw .ink {
  animation: enso-draw 0.9s var(--ease-ink) both;
}
.enso.urgent {
  animation: urgent-pulse 0.65s ease-in-out infinite;
  transform-origin: center;
}
</style>

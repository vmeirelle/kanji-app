<script setup lang="ts">
import BaseImage from './BaseImage.vue'

withDefaults(defineProps<{ src: string; title?: string; size?: number }>(), { size: 9 })
</script>

<template>
  <div class="empty-state">
    <div class="art">
      <span class="glow" aria-hidden="true" />
      <BaseImage class="img" :src="src" :size="size" />
    </div>

    <h2 v-if="title" class="title">{{ title }}</h2>
    <p class="body"><slot /></p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  padding: 2.5rem 1rem;
  text-align: center;
  animation: view-in 0.45s var(--ease-ink) both;
}

.art {
  position: relative;
  display: grid;
  place-items: center;
}
.glow {
  position: absolute;
  width: 78%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, var(--brand) 0%, transparent 68%);
  opacity: 0.12;
  filter: blur(18px);
}
.img {
  position: relative;
  animation: float-idle 4.5s ease-in-out infinite;
  filter: drop-shadow(0 8px 14px rgba(30, 44, 77, 0.16));
}

.title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}
.body {
  max-width: 21rem;
  color: var(--color-text);
  line-height: 1.55;
}
</style>

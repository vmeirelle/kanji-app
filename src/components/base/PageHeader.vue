<script setup lang="ts">
import BaseImage from './BaseImage.vue'

// Shared page header: Japanese subtitle, title, mascot image and a divider.
// The Japanese line takes the level colour (--lv) when the page provides one.
// The mascot is sized by height so images of different aspect ratios match.
defineProps<{ title: string; jp?: string; image?: string }>()
</script>

<template>
  <header class="page-head">
    <div class="text">
      <span v-if="jp" class="jp">{{ jp }}</span>
      <h1 class="title">{{ title }}</h1>
    </div>
    <BaseImage v-if="image" class="mascot" :src="image" :height="4.4" alt="" />
  </header>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}
.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.jp {
  font-family: var(--font-kanji);
  font-size: 0.8rem;
  color: var(--lv, var(--accent));
}
.title {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-heading);
}
.mascot {
  flex: none;
}
</style>

<script setup lang="ts">
import KanjiBadge from './KanjiBadge.vue'

withDefaults(defineProps<{ compact?: boolean; end?: boolean }>(), {
  compact: false,
  end: false,
})
</script>

<template>
  <span class="brand-mark" :class="{ end }">
    <KanjiBadge char="読" :size="2.5" />
    <span v-if="!compact" class="word">
      <span class="name">Yomi</span>
      <span class="tag">Kanji reading</span>
    </span>
  </span>
</template>

<style scoped>
.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}
.brand-mark.end {
  flex-direction: row-reverse;
}
.brand-mark.end .word {
  text-align: right;
}
.word {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  text-align: left;
}
.name {
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: 0.01em;
  color: var(--color-heading);
}
.tag {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  color: var(--color-text);
  opacity: 0.75;
}
</style>

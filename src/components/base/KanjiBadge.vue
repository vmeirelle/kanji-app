<script setup lang="ts">
// A kanji rendered in a coloured tile with a black (ink) glyph.
// Rounded-square by default (brand mark), fully round for section icons.
withDefaults(defineProps<{ char: string; size?: number; round?: boolean }>(), {
  size: 2.5,
  round: false,
})
</script>

<template>
  <span class="badge" :class="{ round }" :style="{ '--size': size + 'rem' }">
    <span class="glyph">{{ char }}</span>
  </span>
</template>

<style scoped>
.badge {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--size);
  height: var(--size);
  border-radius: 0.28em;
  background: var(--paper);
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}
.badge.round {
  border-radius: 50%;
}
.glyph {
  display: block;
  font-family: var(--font-kanji);
  font-size: calc(var(--size) * 0.58);
  line-height: 1;
  color: var(--ink);
  /* Optically centre the glyph — CJK metrics sit slightly low otherwise. */
  transform: translateY(-0.04em);
}
</style>

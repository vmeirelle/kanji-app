<script setup lang="ts">
// Shared sober crossfade — no movement. Wraps a single element/component;
// give the child a :key so swapping it triggers the fade.
withDefaults(defineProps<{ mode?: 'out-in' | 'in-out' }>(), { mode: 'out-in' })
</script>

<template>
  <Transition name="fade" :mode="mode">
    <slot />
  </Transition>
</template>

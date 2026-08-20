<script setup lang="ts">
withDefaults(defineProps<{ mode?: 'out-in' | 'in-out' }>(), { mode: 'out-in' })
</script>

<template>
  <Transition name="fade" :mode="mode">
    <slot />
  </Transition>
</template>

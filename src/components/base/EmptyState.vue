<script setup lang="ts">
import { Size, Color, Align, Space } from '../../composables/useTheme'
import BaseStack from './BaseStack.vue'
import BaseImage from './BaseImage.vue'
import BaseText from './BaseText.vue'

withDefaults(defineProps<{ src: string; title?: string; size?: number }>(), { size: 10 })
</script>

<template>
  <div class="empty-state">
    <BaseStack :align="Align.Center" :gap="Space.Sm">
      <BaseImage :src="src" :size="size" />
      <BaseText v-if="title" :size="Size.Xl" :color="Color.Heading" bold :align="Align.Center">
        {{ title }}
      </BaseText>
      <BaseText :color="Color.Text" :align="Align.Center"><slot /></BaseText>
    </BaseStack>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  justify-content: center;
  padding: 2.5rem 1rem;
}
</style>

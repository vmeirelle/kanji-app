<script setup lang="ts">
import type { SavedLesson } from '../saved'
import { Size, Color, Align, Direction, Space, Variant } from '../composables/useTheme'
import BaseText from '../components/base/BaseText.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseIcon from '../components/base/BaseIcon.vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseStack from '../components/base/BaseStack.vue'
import BaseProgress from '../components/base/BaseProgress.vue'

defineProps<{ lessons: SavedLesson[] }>()
const emit = defineEmits<{ resume: [id: string]; drop: [id: string] }>()

const answered = (l: SavedLesson) => l.passTotal - l.queue.length
const when = (iso: string) => new Date(iso).toLocaleString()
</script>

<template>
  <BaseText v-if="!lessons.length" :align="Align.Center" :color="Color.Text">
    Nothing paused. Stop a round mid-way and it waits for you here.
  </BaseText>

  <BaseStack v-else :gap="Space.Sm">
    <BaseCard v-for="l in lessons" :key="l.id">
      <BaseStack :direction="Direction.Row" :align="Align.Center" :gap="Space.Sm">
        <BaseStack grow :gap="Space.Xxs">
          <BaseText :color="Color.Heading" bold truncate>{{ l.label }}</BaseText>
          <BaseText :size="Size.Xs" :color="Color.Text">
            {{ answered(l) }}/{{ l.passTotal }} answered · {{ when(l.date) }}
          </BaseText>
          <BaseProgress :value="(answered(l) / l.passTotal) * 100" :height="0.3" />
        </BaseStack>
        <BaseButton :variant="Variant.Primary" :size="Size.Sm" @click="emit('resume', l.id)">
          Resume
        </BaseButton>
        <BaseButton :variant="Variant.Ghost" :size="Size.Sm" @click="emit('drop', l.id)">
          <BaseIcon :color="Color.Text">✕</BaseIcon>
        </BaseButton>
      </BaseStack>
    </BaseCard>
  </BaseStack>
</template>

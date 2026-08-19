<script setup lang="ts">
import type { SavedLesson } from '../saved'
import { levelColor } from '../data/blocks'
import { Size, Color, Align, Direction, Space, Variant } from '../composables/useTheme'
import BaseText from '../components/base/BaseText.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseIcon from '../components/base/BaseIcon.vue'
import BaseStack from '../components/base/BaseStack.vue'
import BaseProgress from '../components/base/BaseProgress.vue'
import EmptyState from '../components/base/EmptyState.vue'
import PageHeader from '../components/base/PageHeader.vue'

defineProps<{ lessons: SavedLesson[] }>()
const emit = defineEmits<{ resume: [id: string]; drop: [id: string] }>()

const answered = (l: SavedLesson) => l.passTotal - l.queue.length
const levelOf = (l: SavedLesson) => l.levels[0] ?? ''
const catCount = (l: SavedLesson) => l.selected.length
const when = (iso: string) => new Date(iso).toLocaleString()
</script>

<template>
  <div class="saved">
    <PageHeader jp="未完の稽古" title="Unfinished" image="/reading.png" />

    <div class="scroll">
      <EmptyState v-if="!lessons.length" src="/peace.png">
        Nothing paused. Stop a round mid-way and it waits for you here.
      </EmptyState>

      <BaseStack v-else :gap="Space.Sm">
        <div class="lesson" v-for="l in lessons" :key="l.id" :style="{ '--lv': levelColor(levelOf(l)) }">
          <BaseStack :direction="Direction.Row" :align="Align.Center" :gap="Space.Sm">
            <span class="lvl">{{ levelOf(l) }}</span>
            <BaseStack grow :gap="Space.Xxs">
              <BaseText :color="Color.Heading" bold truncate>
                {{ catCount(l) }} {{ catCount(l) === 1 ? 'category' : 'categories' }}
              </BaseText>
              <BaseText :size="Size.Xs" :color="Color.Text">
                {{ answered(l) }}/{{ l.passTotal }} answered · {{ when(l.date) }}
              </BaseText>
              <BaseProgress
                :value="(answered(l) / l.passTotal) * 100"
                :height="0.3"
                color="var(--lv)"
              />
            </BaseStack>
            <button class="resume" @click="emit('resume', l.id)">Resume</button>
            <BaseButton :variant="Variant.Ghost" :size="Size.Sm" @click="emit('drop', l.id)">
              <BaseIcon :color="Color.Text">✕</BaseIcon>
            </BaseButton>
          </BaseStack>
        </div>
      </BaseStack>
    </div>
  </div>
</template>

<style scoped>
.saved {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 1.25rem;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-hover) transparent;
}
.lesson {
  padding: 0.85rem;
  border: 2px solid color-mix(in srgb, var(--lv) 35%, var(--color-border));
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--lv) 9%, var(--color-background));
}
.lvl {
  flex: none;
  align-self: flex-start;
  font-family: var(--font-kanji);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  color: var(--lv, var(--brand));
}
.resume {
  flex: none;
  border: none;
  border-radius: 0.6rem;
  padding: 0.5rem 0.9rem;
  background: var(--lv, var(--brand));
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
</style>

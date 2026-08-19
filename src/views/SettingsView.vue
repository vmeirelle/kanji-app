<script setup lang="ts">
import { useSettings, type AutoSound, type JpFont, type Theme } from '../composables/useSettings'
import BaseSegment from '../components/base/BaseSegment.vue'
import PageHeader from '../components/base/PageHeader.vue'

const s = useSettings()

const soundOptions = [
  { value: 'never', label: 'Never' },
  { value: 'fail', label: 'On miss' },
  { value: 'all', label: 'Always' },
]
const fontOptions = [
  { value: 'both', label: 'Kanji + Kana' },
  { value: 'kanji', label: 'Kanji' },
  { value: 'none', label: 'None' },
]
const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]
const onOff = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
]
</script>

<template>
  <section class="settings">
    <PageHeader jp="設定" title="Settings" image="/writing.png" />

    <div class="scroll">
      <div class="group">
        <span class="tag">Auto pronunciation</span>
        <BaseSegment
          :options="soundOptions"
          :model-value="s.autoSound"
          @update:model-value="s.autoSound = $event as AutoSound"
        />
        <p class="hint">Play the reading automatically when a card is revealed.</p>
      </div>

      <div class="group">
        <span class="tag">Japanese font</span>
        <BaseSegment
          :options="fontOptions"
          :model-value="s.jpFont"
          @update:model-value="s.jpFont = $event as JpFont"
        />
        <p class="hint">Where to use the textbook (Klee) font.</p>
      </div>

      <div class="group">
        <span class="tag">Level colors</span>
        <BaseSegment
          :options="onOff"
          :model-value="s.noLevelColors ? 'off' : 'on'"
          @update:model-value="s.noLevelColors = $event === 'off'"
        />
      </div>

      <div class="group">
        <span class="tag">Animations</span>
        <BaseSegment
          :options="onOff"
          :model-value="s.noMotion ? 'off' : 'on'"
          @update:model-value="s.noMotion = $event === 'off'"
        />
      </div>

      <div class="group">
        <span class="tag">Theme</span>
        <BaseSegment
          :options="themeOptions"
          :model-value="s.theme"
          @update:model-value="s.theme = $event as Theme"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.tag {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
}
.hint {
  font-size: 0.8rem;
  color: var(--color-text);
  opacity: 0.85;
}
</style>

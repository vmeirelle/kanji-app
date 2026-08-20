<script setup lang="ts">
import { computed, watch } from 'vue'
import SquareGrid, { type GridItem } from '../components/base/SquareGrid.vue'
import { useSpeech } from '../composables/useSpeech'
import { useSettings } from '../composables/useSettings'
import { isJapanese, scriptOf, type Question } from '../quiz'

const { supported, speak } = useSpeech()
const settings = useSettings()

const props = defineProps<{
  prompt: string
  question: Question
  chosenKey: string | null
  disabled?: boolean
  countdown?: number | null
}>()
const emit = defineEmits<{ answer: [key: string] }>()

const verdict = computed(() => {
  if (!props.chosenKey) return null
  return props.question.options.find((o) => o.key === props.chosenKey)?.correct ? 'ok' : 'no'
})

const promptScript = computed(() => scriptOf(props.prompt))

const sayText = computed(() => {
  const t = props.question.target
  return isJapanese(t.kana) ? t.kana : t.char
})
const showMeaning = computed(() => props.question.target.meaning !== props.question.target.kana)

watch(
  () => props.chosenKey,
  (key, prev) => {
    if (!key || prev) return
    const mode = settings.autoSound
    if (mode === 'all' || (mode === 'fail' && verdict.value === 'no')) {
      speak(sayText.value)
    }
  },
)

const items = computed<GridItem[]>(() =>
  props.question.options.map((o) => {
    if (!props.chosenKey) return { key: o.key, label: o.label }
    if (o.correct) return { key: o.key, label: o.label, state: 'correct' }

    if (o.key === props.chosenKey)
      return { key: o.key, label: o.label, state: 'wrong', detail: o.facets }
    return { key: o.key, label: o.label }
  }),
)
</script>

<template>
  <div class="quiz">

    <div class="stage" :class="{ raised: chosenKey }">
      <div class="card" :class="{ flipped: chosenKey }">
        <div class="face front">
          <span
            v-if="countdown != null && !chosenKey"
            class="timer"
            :class="{ low: countdown <= 3 }"
          >
            {{ countdown }}s
          </span>
          <div
            class="glyph"
            :class="{ en: promptScript === 'latin', kana: promptScript === 'kana' }"
          >
            {{ prompt }}
          </div>
        </div>
        <div class="face back" :class="verdict">
          <template v-if="chosenKey">
            <button
              v-if="supported"
              type="button"
              class="say glyph small"
              aria-label="Play pronunciation"
              @click.stop="speak(sayText)"
            >
              {{ question.target.char }}
            </button>
            <div v-else class="glyph small">{{ question.target.char }}</div>
            <dl class="info">
              <div class="reading">
                <dt>Reading</dt>
                <dd>
                  <button
                    v-if="supported"
                    type="button"
                    class="say-word"
                    aria-label="Play pronunciation"
                    @click.stop="speak(sayText)"
                  >
                    {{ question.target.kana }}
                    <span class="say-icon">🔊</span>
                  </button>
                  <template v-else>{{ question.target.kana }}</template>
                </dd>
              </div>
              <div v-if="showMeaning"><dt>Meaning</dt><dd>{{ question.target.meaning }}</dd></div>
            </dl>
          </template>
        </div>
      </div>
    </div>

    <SquareGrid :items="items" :disabled="disabled" @select="emit('answer', $event)" />
  </div>
</template>

<style scoped>
.quiz {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.stage {
  perspective: 1000px;
}
.card {
  position: relative;
  height: 11rem;
}
.face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-background-soft);
  backface-visibility: hidden;

  transition:
    transform 0.28s ease-out,
    opacity 0s linear 0.14s;
}
.back {
  transform: rotateY(-180deg);
  opacity: 0;
}
.card.flipped .front {
  transform: rotateY(180deg);
  opacity: 0;
}
.card.flipped .back {
  transform: rotateY(0deg);
  opacity: 1;
}
.back.ok {
  border-color: var(--ok);
  background: var(--ok-soft);
}
.back.ok .glyph,
.back.ok dd {
  color: var(--ok);
}
.back.no {
  border-color: var(--danger);
  background: var(--danger-soft);
}
.back.no .glyph,
.back.no dd {
  color: var(--danger);
}
.timer {
  position: absolute;
  top: 0.6rem;
  right: 0.75rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.timer.low {
  background: var(--danger-soft);
  color: var(--danger);
}
.stage.raised {
  position: relative;
  z-index: 6;
}
.glyph {
  min-width: 0;
  font-family: var(--font-kanji);
  font-size: clamp(4rem, 22vw, 6.5rem);
  line-height: 1;
  text-align: center;
  color: var(--color-heading);
  word-break: break-word;
}
.glyph.small {
  font-size: clamp(3rem, 16vw, 4.5rem);
}
.glyph.kana {
  font-family: var(--font-kana);
}
.glyph.en {
  font-family: inherit;
  font-size: clamp(1.5rem, 7vw, 2.6rem);
  font-weight: 700;
}
.reading dd {
  font-family: var(--font-kana);
}
.say {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.say-word {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  color: inherit;
  padding: 0;
}
.say-icon {
  font-size: 1rem;
  line-height: 1;
  opacity: 0.7;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.info div {
  display: flex;
  flex-direction: column;
}
@media (prefers-reduced-motion: reduce) {
  .face {
    transition: none;
  }
}
.info dt {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text);
}
.info dd {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: var(--color-heading);
}
</style>

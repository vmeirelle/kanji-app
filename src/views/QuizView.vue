<script setup lang="ts">
import { computed } from 'vue'
import SquareGrid, { type GridItem } from '../components/base/SquareGrid.vue'
import BaseEnso from '../components/base/BaseEnso.vue'
import MascotReaction, { type MascotState } from '../components/base/MascotReaction.vue'
import { useSpeech } from '../composables/useSpeech'
import type { Question } from '../quiz'

const { supported, speak } = useSpeech()

const props = withDefaults(
  defineProps<{
    prompt: string
    question: Question
    chosenKey: string | null
    disabled?: boolean
    countdown?: number | null
    /** Segundos totais do cronômetro, para o preenchimento do enso. */
    timerTotal?: number
    /** O enunciado está em japonês (kanji/kana) e não em inglês. */
    promptJp?: boolean
    /** As alternativas estão em japonês. */
    answerJp?: boolean
    streak?: number
    /** Cor do nível JLPT, usada como luz ambiente. */
    accent?: string
  }>(),
  { timerTotal: 15, streak: 0, accent: 'var(--brand)' },
)
const emit = defineEmits<{ answer: [key: string] }>()

const matched = computed(() =>
  props.chosenKey ? props.question.options.find((o) => o.key === props.chosenKey) : undefined,
)

// Estourou o tempo: há uma escolha registrada, mas nenhuma alternativa casa.
const isTimeout = computed(() => !!props.chosenKey && !matched.value)

const verdict = computed(() => {
  if (!props.chosenKey) return null
  return matched.value?.correct ? 'ok' : 'no'
})

const mascot = computed<MascotState>(() => {
  if (!props.chosenKey) return 'idle'
  if (isTimeout.value) return 'timeout'
  return matched.value?.correct ? 'correct' : 'wrong'
})

const timerPct = computed(() =>
  props.countdown == null
    ? 0
    : Math.max(0, Math.min(100, (props.countdown / props.timerTotal) * 100)),
)
const urgent = computed(() => props.countdown != null && props.countdown <= 3 && !props.chosenKey)
const timerColor = computed(() => {
  if (props.countdown == null) return 'var(--brand)'
  if (props.countdown <= 3) return 'var(--danger)'
  if (props.countdown <= 7) return 'var(--lv-N2)'
  return 'var(--ok)'
})

const items = computed<GridItem[]>(() =>
  props.question.options.map((o) => {
    const base = { key: o.key, label: o.label, jp: props.answerJp }
    if (!props.chosenKey) return base
    if (o.correct) return { ...base, state: 'correct' as const }
    if (o.key === props.chosenKey) return { ...base, state: 'wrong' as const, detail: o.facets }
    return base
  }),
)
</script>

<template>
  <div class="quiz" :style="{ '--accent': accent }">
    <div class="stage" :class="{ raised: chosenKey }">
      <div class="halo" :class="verdict" aria-hidden="true" />

      <div class="card" :class="[verdict, { flipped: chosenKey }]">
        <div class="face front">
          <div v-if="countdown != null && !chosenKey" class="timer" :class="{ low: countdown <= 3 }">
            <BaseEnso
              :value="timerPct"
              :size="3.1"
              :color="timerColor"
              :stroke-width="7"
              :urgent="urgent"
            />
            <span class="timer-n">{{ countdown }}</span>
          </div>

          <div :key="prompt" class="glyph ink" :lang="promptJp ? 'ja' : undefined">
            {{ prompt }}
          </div>
        </div>

        <div class="face back" :class="verdict">
          <button
            v-if="supported"
            type="button"
            class="say glyph small"
            lang="ja"
            aria-label="Play pronunciation"
            @click.stop="speak(question.target.kana)"
          >
            {{ question.target.char }}
          </button>
          <div v-else class="glyph small" lang="ja">{{ question.target.char }}</div>

          <dl class="info">
            <div>
              <dt>Reading</dt>
              <dd>
                <button
                  v-if="supported"
                  type="button"
                  class="say-word"
                  lang="ja"
                  aria-label="Play pronunciation"
                  @click.stop="speak(question.target.kana)"
                >
                  {{ question.target.kana }}
                  <span class="say-icon" aria-hidden="true">🔊</span>
                </button>
                <template v-else>{{ question.target.kana }}</template>
              </dd>
            </div>
            <div><dt>Meaning</dt><dd>{{ question.target.meaning }}</dd></div>
          </dl>
        </div>
      </div>

      <MascotReaction class="mascot" :state="mascot" :streak="streak" :beat="prompt" :size="5" />
    </div>

    <SquareGrid :items="items" :disabled="disabled" :beat="prompt" @select="emit('answer', $event)" />
  </div>
</template>

<style scoped>
.quiz {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

/* --- palco ------------------------------------------------------- */
.stage {
  position: relative;
  perspective: 1400px;
}
/* Depois de responder o palco sobe acima da camada de "tocar para
   continuar", senão os botões de pronúncia ficariam inalcançáveis. */
.stage.raised {
  z-index: 6;
}

/* Luz ambiente na cor do nível, atrás do card. */
.halo {
  position: absolute;
  inset: -12% 4%;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--accent) 0%, transparent 68%);
  opacity: 0.16;
  filter: blur(28px);
  pointer-events: none;
  animation: glow-breathe 5s ease-in-out infinite;
  transition: background 0.5s var(--ease-soft);
}
.halo.ok {
  background: radial-gradient(ellipse, var(--ok) 0%, transparent 68%);
  opacity: 0.3;
}
.halo.no {
  background: radial-gradient(ellipse, var(--danger) 0%, transparent 68%);
  opacity: 0.3;
}

/* --- card -------------------------------------------------------- */
.card {
  position: relative;
  height: 12rem;
  transform-style: preserve-3d;
  transition: transform 0.55s var(--ease-spring);
}
.card.flipped {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 1.25rem;

  border: 1.5px solid var(--color-border);
  border-radius: var(--r-xl);
  background: linear-gradient(160deg, var(--color-background-soft), var(--color-background));
  box-shadow: var(--shadow-lg), var(--shadow-inset);

  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: border-color 0.4s var(--ease-soft), box-shadow 0.4s var(--ease-soft);
}
.back {
  transform: rotateY(180deg);
}

.back.ok {
  border-color: var(--ok);
  background: linear-gradient(160deg, var(--ok-soft), var(--color-background));
  box-shadow: 0 0 0 2px var(--ok-glow), var(--shadow-lg);
}
.back.ok .glyph,
.back.ok dd {
  color: var(--ok);
}
.back.no {
  border-color: var(--danger);
  background: linear-gradient(160deg, var(--danger-soft), var(--color-background));
  box-shadow: 0 0 0 2px var(--danger-glow), var(--shadow-lg);
}
.back.no .glyph,
.back.no dd {
  color: var(--danger);
}

/* --- cronômetro enso --------------------------------------------- */
.timer {
  position: absolute;
  top: 0.7rem;
  right: 0.8rem;
  display: grid;
  place-items: center;
}
.timer > * {
  grid-area: 1 / 1;
}
.timer-n {
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-heading);
  transition: color 0.3s var(--ease-soft);
}
.timer.low .timer-n {
  color: var(--danger);
}

/* --- glifo ------------------------------------------------------- */
.glyph {
  min-width: 0;
  font-family: var(--font-kanji);
  font-size: clamp(3.4rem, 20vw, 6rem);
  line-height: 1.05;
  text-align: center;
  color: var(--color-heading);
  word-break: break-word;
  hyphens: auto;
}
/* A tinta assenta: desfocada e maior, depois firma. */
.glyph.ink {
  animation: ink-settle 0.6s var(--ease-ink) both;
}
.glyph.small {
  font-size: clamp(2.6rem, 14vw, 4rem);
}

/* --- pronúncia ---------------------------------------------------- */
.say {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  border-radius: var(--r-md);
  transition: transform 0.2s var(--ease-spring);
}
.say:hover {
  transform: scale(1.06);
}
.say:active {
  transform: scale(0.96);
}
.say-word {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  border-radius: var(--r-sm);
  transition: opacity 0.2s var(--ease-soft);
}
.say-word:hover {
  opacity: 0.75;
}
.say-icon {
  font-size: 0.95rem;
  line-height: 1;
  opacity: 0.65;
}

/* --- verso ------------------------------------------------------- */
.info {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.info div {
  display: flex;
  flex-direction: column;
}
.info dt {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text);
}
.info dd {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  color: var(--color-heading);
}

/* --- mascote ------------------------------------------------------ */
.mascot {
  position: absolute;
  right: -0.5rem;
  bottom: -2.2rem;
  z-index: 3;
  width: 4.6rem;
}
@media (min-width: 30rem) {
  .mascot {
    right: -1.5rem;
    bottom: -2.6rem;
    width: 5.6rem;
  }
}
</style>

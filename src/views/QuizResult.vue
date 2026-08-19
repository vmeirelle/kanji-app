<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuiz } from '../composables/useQuiz'
import { useRankings } from '../composables/useRankings'
import { today } from '../rankings'
import { levelColor } from '../data/blocks'
import { Size, Color, Align, Variant } from '../composables/useTheme'
import BaseImage from '../components/base/BaseImage.vue'
import BaseText from '../components/base/BaseText.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseEnso from '../components/base/BaseEnso.vue'

const q = useQuiz()
const { save } = useRankings()

const name = ref('')
const saved = ref(false)

const isRanked = computed(() => q.mode.value === 'ranked')
const accent = computed(() => levelColor(q.level.value))

const sticker = computed(() => {
  const p = q.pct.value
  if (p >= 90) return '/eureka.png'
  if (p >= 70) return '/happy.png'
  if (p >= 40) return '/confused.png'
  return '/dead.png'
})

const headline = computed(() => {
  const p = q.pct.value
  if (p >= 90) return { jp: '見事', en: 'Masterful' }
  if (p >= 70) return { jp: 'よくできました', en: 'Well done' }
  if (p >= 40) return { jp: 'その調子', en: 'Keep going' }
  return { jp: 'また挑戦', en: 'Try again' }
})

/* --- contagem crescente ------------------------------------------- */
const shown = ref(0)
const target = computed(() => (isRanked.value ? q.rankedScore.value : q.pct.value))
let raf = 0

function countUp() {
  const to = target.value
  const dur = 900
  const t0 = performance.now()
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / dur)
    shown.value = Math.round(to * (1 - Math.pow(1 - k, 3))) // easeOutCubic
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

/* --- respingos de tinta ------------------------------------------- */
type Splash = { id: number; style: Record<string, string> }
const splashes = ref<Splash[]>([])

function burst() {
  if (q.pct.value < 70) return
  const palette = ['var(--ok)', 'var(--accent)', 'var(--lv-N3)', 'var(--lv-N2)']
  splashes.value = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    style: {
      '--dx': `${(Math.random() - 0.5) * 260}px`,
      '--dy': `${-90 - Math.random() * 190}px`,
      '--ds': `${0.5 + Math.random() * 1.1}`,
      '--dr': `${(Math.random() - 0.5) * 540}deg`,
      left: `${18 + Math.random() * 64}%`,
      background: palette[i % palette.length] as string,
      animationDelay: `${Math.random() * 0.28}s`,
      borderRadius: Math.random() > 0.5 ? '50%' : '30% 70% 62% 38%',
    },
  }))
}

onMounted(() => {
  countUp()
  burst()
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

function saveScore() {
  if (!name.value.trim() || saved.value || !isRanked.value) return
  save({
    name: name.value.trim(),
    level: q.level.value,
    correct: q.firstCorrect.value,
    total: q.firstTotal.value,
    points: q.rankedScore.value,
    day: today(),
    date: new Date().toISOString(),
  })
  saved.value = true
}

function finish() {
  q.restart()
  name.value = ''
  saved.value = false
}
</script>

<template>
  <div class="overlay" :style="{ '--accent': accent }">
    <div class="splashes" aria-hidden="true">
      <span v-for="s in splashes" :key="s.id" class="splash" :style="s.style" />
    </div>

    <div class="modal">
      <div class="crest">
        <BaseEnso
          class="ring"
          :value="q.pct.value"
          :size="8.5"
          :color="accent"
          :stroke-width="4"
          draw
        />
        <BaseImage class="sticker" :src="sticker" :size="5.6" />
      </div>

      <p class="headline">
        <span class="hl-jp" lang="ja">{{ headline.jp }}</span>
        <span class="hl-en">{{ headline.en }}</span>
      </p>

      <div class="score">
        <span class="big">{{ shown }}</span>
        <span class="unit">{{ isRanked ? 'pts' : '%' }}</span>
      </div>

      <div class="stats">
        <span class="stat">
          <strong>{{ q.firstCorrect.value }}/{{ q.firstTotal.value }}</strong>
          <em>correct</em>
        </span>
        <span class="div" />
        <span class="stat">
          <strong>{{ q.pct.value }}%</strong>
          <em>accuracy</em>
        </span>
        <template v-if="q.bestStreak.value >= 3">
          <span class="div" />
          <span class="stat">
            <strong class="hot">✦ {{ q.bestStreak.value }}</strong>
            <em>best streak</em>
          </span>
        </template>
      </div>

      <span class="badge">{{ q.level.value }} · {{ isRanked ? 'Ranked' : 'Custom' }}</span>

      <BaseText
        v-if="q.hasRetried.value"
        class="retry-note"
        :size="Size.Xs"
        :color="q.incorrectCount.value ? Color.Text : Color.Correct"
        :align="Align.Center"
        bold
      >
        <template v-if="q.incorrectCount.value">
          Retry {{ q.correct.value }}/{{ q.passTotal.value }} · {{ q.incorrectCount.value }} to go
        </template>
        <template v-else>All misses cleared ✓</template>
      </BaseText>

      <div class="actions">
        <BaseButton v-if="q.canRetry.value" :variant="Variant.Plain" block @click="q.retryIncorrect">
          Retry incorrect ({{ q.incorrectCount.value }})
        </BaseButton>

        <template v-if="isRanked">
          <input
            v-model="name"
            class="input"
            type="text"
            placeholder="Your name"
            maxlength="20"
            :disabled="saved"
            @keyup.enter="saveScore"
          />
          <button
            class="save"
            :class="{ done: saved }"
            :disabled="saved || !name.trim()"
            @click="saveScore"
          >
            {{ saved ? 'Saved ✓' : 'Save to ranking' }}
          </button>
        </template>

        <BaseButton :variant="Variant.Ghost" block @click="finish">Finish</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(20, 20, 22, 0.62);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  animation: view-in 0.32s var(--ease-soft) both;
}
@media (min-width: 48rem) {
  .overlay {
    padding-left: calc(var(--sidebar) + 1rem);
  }
}

/* --- respingos ---------------------------------------------------- */
.splashes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.splash {
  position: absolute;
  top: 52%;
  width: 11px;
  height: 11px;
  opacity: 0;
  animation: ink-splash 1.5s var(--ease-ink) both;
}

/* --- modal -------------------------------------------------------- */
.modal {
  position: relative;
  width: 100%;
  max-width: 23rem;
  max-height: 92vh;
  overflow-y: auto;
  padding: 1.6rem 1.5rem 1.4rem;

  background: linear-gradient(165deg, var(--color-background-soft), var(--color-background));
  border: 1.5px solid var(--color-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-lg);

  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  text-align: center;

  animation: pop-in 0.5s var(--ease-spring) both;
}

/* --- brasão: enso de precisão + mascote ---------------------------- */
.crest {
  position: relative;
  display: grid;
  place-items: center;
  align-self: center;
  margin-bottom: 0.2rem;
}
.crest > * {
  grid-area: 1 / 1;
}
.sticker {
  animation: seal-stamp 0.62s var(--ease-spring) 0.25s both;
}

/* --- título -------------------------------------------------------- */
.headline {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.hl-jp {
  font-family: var(--font-kanji);
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-heading);
}
.hl-en {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text);
}

/* --- pontuação ----------------------------------------------------- */
.score {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.35rem;
  line-height: 1;
}
.big {
  font-size: 3.2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent, var(--brand));
  letter-spacing: -0.02em;
}
.unit {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

/* --- estatísticas --------------------------------------------------- */
.stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  padding: 0.6rem 0;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.stat strong {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--color-heading);
  font-variant-numeric: tabular-nums;
}
.stat strong.hot {
  background: linear-gradient(135deg, var(--lv-N3), var(--lv-N1));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.stat em {
  font-size: 0.66rem;
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text);
}
.div {
  width: 1px;
  align-self: stretch;
  background: var(--color-border);
}

.badge {
  align-self: center;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent, var(--brand)) 40%, transparent);
  background: color-mix(in srgb, var(--accent, var(--brand)) 12%, transparent);
  color: var(--accent, var(--brand));
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.retry-note {
  margin-top: 0.2rem;
}

/* --- ações ---------------------------------------------------------- */
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 0.6rem;
}

.input {
  padding: 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--r-md);
  background: var(--color-background);
  color: var(--color-heading);
  font-size: 1rem;
  text-align: center;
  transition: border-color 0.2s var(--ease-soft), box-shadow 0.2s var(--ease-soft);
}
.input:focus {
  outline: none;
  border-color: var(--accent, var(--brand));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, var(--brand)) 22%, transparent);
}

.save {
  padding: 0.85rem 1.25rem;
  border: 1.5px solid var(--accent, var(--brand));
  border-radius: var(--r-md);
  background: var(--accent, var(--brand));
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s var(--ease-soft);
}
.save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.save:disabled {
  opacity: 0.45;
  cursor: default;
}
.save.done {
  opacity: 1;
  border-color: var(--ok);
  background: var(--ok);
}
</style>

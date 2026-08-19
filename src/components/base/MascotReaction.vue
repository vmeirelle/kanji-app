<script setup lang="ts">
/**
 * O mascote como voz emocional do quiz.
 *
 * Antes ele só aparecia na tela de resultado, depois que tudo já tinha
 * acabado. Aqui ele acompanha o round e reage a cada resposta — é o que
 * transforma o loop de "responder" em "jogar".
 *
 * Cada troca de estado remonta o <img> via :key, o que reinicia a animação
 * CSS mesmo quando o mesmo estado se repete duas vezes seguidas.
 */
import { computed } from 'vue'

export type MascotState = 'idle' | 'thinking' | 'correct' | 'wrong' | 'timeout'

const props = withDefaults(
  defineProps<{
    state?: MascotState
    /** Largura em rem. */
    size?: number
    /** Acertos seguidos — acende a chama a partir de 3. */
    streak?: number
    /** Muda a cada pergunta, para reancorar a animação. */
    beat?: number | string
  }>(),
  { state: 'idle', size: 5, streak: 0, beat: 0 },
)

const SPRITES: Record<MascotState, string> = {
  idle: '/reading.png',
  thinking: '/writing.png',
  correct: '/eureka.png',
  wrong: '/confused.png',
  timeout: '/dead.png',
}

const src = computed(() => SPRITES[props.state])
const hot = computed(() => props.streak >= 3)
const blazing = computed(() => props.streak >= 6)

const ALT: Record<MascotState, string> = {
  idle: 'Sensei reading',
  thinking: 'Sensei writing',
  correct: 'Sensei celebrating a correct answer',
  wrong: 'Sensei confused by a wrong answer',
  timeout: 'Sensei out of time',
}
</script>

<template>
  <div class="mascot" :class="state" :style="{ width: `${size}rem` }">
    <div v-if="hot" class="aura" :class="{ blazing }" />

    <img :key="`${state}-${beat}`" class="sprite" :src="src" :alt="ALT[state]" />

    <Transition name="combo">
      <span v-if="streak >= 3" :key="streak" class="combo" :class="{ blazing }">
        {{ blazing ? '🔥' : '✦' }} {{ streak }}
      </span>
    </Transition>
  </div>
</template>

<style scoped>
.mascot {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex: none;
  pointer-events: none;
  user-select: none;
}
.sprite {
  width: 100%;
  height: auto;
  display: block;
  transform-origin: 50% 90%;
  filter: drop-shadow(0 6px 10px rgba(30, 44, 77, 0.22));
}

/* --- reações --------------------------------------------------- */
.mascot.idle .sprite,
.mascot.thinking .sprite {
  animation: float-idle 3.6s ease-in-out infinite;
}
.mascot.correct .sprite {
  animation: mascot-cheer 0.72s var(--ease-spring) both;
}
.mascot.wrong .sprite,
.mascot.timeout .sprite {
  animation: mascot-flinch 0.55s ease-out both;
}

/* --- halo de sequência ----------------------------------------- */
.aura {
  position: absolute;
  inset: -18%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--ok-glow) 0%, transparent 68%);
  animation: glow-breathe 2.2s ease-in-out infinite;
}
.aura.blazing {
  background: radial-gradient(circle, rgba(255, 154, 77, 0.55) 0%, transparent 68%);
  animation-duration: 1.3s;
}

/* --- contador de combo ----------------------------------------- */
.combo {
  position: absolute;
  top: -0.5rem;
  right: -0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--ok);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  box-shadow: var(--shadow-sm);
  white-space: nowrap;
}
.combo.blazing {
  background: linear-gradient(135deg, #ff9a4d, #e05c4e);
}

.combo-enter-active {
  animation: pop-in 0.42s var(--ease-spring) both;
}
.combo-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.combo-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>

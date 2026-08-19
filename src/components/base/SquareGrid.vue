<script setup lang="ts">
import { computed } from 'vue'

type State = 'correct' | 'wrong'

export type GridItem = {
  key: string
  label: string
  state?: State
  detail?: { char: string; kana: string; meaning: string }
  /** Rotula o texto como japonês, para a cadeia de fontes CJK. */
  jp?: boolean
}

const props = withDefaults(
  defineProps<{
    items: GridItem[]
    disabled?: boolean
    /** Muda a cada pergunta e remonta o grid, reiniciando a cascata. */
    beat?: string | number
  }>(),
  { beat: 0 },
)
const emit = defineEmits<{ select: [key: string] }>()

// Pools pequenos não devem deixar órfãos numa grade fixa de 3 colunas.
const cols = computed(() => (props.items.length <= 4 ? Math.min(2, props.items.length) : 3))

const settled = computed(() => props.items.some((i) => i.state))
</script>

<template>
  <div :key="beat" class="grid" :style="{ '--cols': cols }">
    <button
      v-for="(item, i) in items"
      :key="item.key"
      type="button"
      class="square"
      :class="[item.state, { dim: settled && !item.state }]"
      :style="{ '--i': i }"
      :disabled="disabled"
      @click="emit('select', item.key)"
    >
      <span v-if="item.state === 'correct'" class="ripple" aria-hidden="true" />

      <span v-if="item.detail" class="detail">
        <span class="d-char" lang="ja">{{ item.detail.char }}</span>
        <span class="d-sub" lang="ja">{{ item.detail.kana }}</span>
        <span class="d-sub">{{ item.detail.meaning }}</span>
      </span>
      <span v-else class="label" :lang="item.jp ? 'ja' : undefined">{{ item.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
  gap: 0.7rem;
  justify-content: center;
}

.square {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: 0.5rem;
  overflow: hidden;

  border: 1.5px solid var(--color-border);
  border-radius: var(--r-lg);
  background: var(--color-background-soft);
  box-shadow: var(--shadow-sm), var(--shadow-inset);
  color: var(--color-heading);

  font-size: clamp(1.1rem, 5vw, 1.6rem);
  line-height: 1.2;
  text-align: center;
  cursor: pointer;

  /* Cascata: cada quadrado entra 32ms depois do anterior. */
  animation: tile-in 0.42s var(--ease-spring) both;
  animation-delay: calc(var(--i) * 32ms);

  transition:
    transform 0.18s var(--ease-spring),
    border-color 0.25s var(--ease-soft),
    background 0.25s var(--ease-soft),
    box-shadow 0.25s var(--ease-soft),
    opacity 0.3s var(--ease-soft),
    filter 0.3s var(--ease-soft);
}

.square:active:not(:disabled) {
  transform: scale(0.95);
  box-shadow: var(--shadow-sm);
}
.square:disabled {
  cursor: default;
}

@media (hover: hover) {
  .square:not(:disabled):hover {
    transform: translateY(-3px);
    border-color: var(--lv, var(--color-border-hover));
    box-shadow: var(--shadow-md), var(--shadow-inset);
  }
}

/* --- veredito --------------------------------------------------- */
.square.correct {
  border-color: var(--ok);
  background: var(--ok-soft);
  color: var(--ok);
  box-shadow: 0 0 0 3px var(--ok-glow), var(--shadow-md);
  transform: scale(1.04);
  z-index: 2;
}

.square.wrong {
  border-color: var(--danger);
  background: var(--danger-soft);
  color: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-glow), var(--shadow-md);
  animation: shake-x 0.5s var(--ease-sharp) both;
  z-index: 2;
}

/* Os não escolhidos recuam para o fundo. */
.square.dim {
  opacity: 0.4;
  filter: saturate(0.4);
  transform: scale(0.96);
}

/* --- onda de acerto --------------------------------------------- */
.ripple {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, var(--ok-glow) 0%, transparent 62%);
  animation: ripple-out 0.75s var(--ease-ink) both;
  pointer-events: none;
}

/* --- conteúdo ---------------------------------------------------- */
.label[lang='ja'] {
  font-family: var(--font-kanji);
}
.detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  line-height: 1.15;
}
.d-char {
  font-size: clamp(1.3rem, 6vw, 1.9rem);
  font-family: var(--font-kanji);
}
.d-sub {
  font-size: clamp(0.68rem, 3vw, 0.82rem);
  opacity: 0.85;
}
</style>

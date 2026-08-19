<script setup lang="ts">
import { computed } from 'vue'
import { blocksIn, levelColor, levelsOf, type Block } from '../data/blocks'

const props = defineProps<{ blocks: Block[]; selected: string[]; disabled?: boolean }>()
const emit = defineEmits<{ 'update:selected': [string[]] }>()

const groups = computed(() =>
  levelsOf(props.blocks).map((level) => ({ level, blocks: blocksIn(props.blocks, [level]) })),
)
const has = (id: string) => props.selected.includes(id)
const countOn = (blocks: Block[]) => blocks.filter((b) => has(b.id)).length

function toggle(id: string) {
  if (props.disabled) return
  emit(
    'update:selected',
    has(id) ? props.selected.filter((x) => x !== id) : [...props.selected, id],
  )
}

function toggleGroup(blocks: Block[]) {
  if (props.disabled) return
  const ids = blocks.map((b) => b.id)
  emit(
    'update:selected',
    ids.every(has)
      ? props.selected.filter((x) => !ids.includes(x))
      : [...new Set([...props.selected, ...ids])],
  )
}
</script>

<template>
  <div class="groups" :class="{ locked: disabled }">
    <section
      v-for="g in groups"
      :key="g.level"
      class="group"
      :style="{ '--lv': levelColor(g.level) }"
    >
      <div class="head">
        <span class="lv">{{ g.level }}</span>
        <span class="count">{{ countOn(g.blocks) }}/{{ g.blocks.length }} categories</span>
        <button v-if="!disabled" class="all" @click="toggleGroup(g.blocks)">
          {{ g.blocks.every((b) => has(b.id)) ? 'None' : 'All' }}
        </button>
      </div>

      <div class="grid">
        <button
          v-for="(b, i) in g.blocks"
          :key="b.id"
          type="button"
          class="tile"
          :class="{ on: has(b.id) }"
          :style="{ '--i': i }"
          :disabled="disabled"
          :aria-pressed="has(b.id)"
          @click="toggle(b.id)"
        >
          <span class="sweep" aria-hidden="true" />
          <span class="bg-kanji" lang="ja" aria-hidden="true">{{ b.kanji[0]?.char }}</span>
          <span class="check" aria-hidden="true">✓</span>
          <span class="name">{{ b.name }}</span>
          <span class="n">{{ b.kanji.length }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.groups {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* --- cabeçalho do nível ------------------------------------------ */
.head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding-bottom: 0.6rem;
}
.lv {
  position: relative;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--lv);
}
.lv::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.22rem;
  height: 2px;
  border-radius: 2px;
  background: var(--lv);
  opacity: 0.45;
}
.count {
  flex: 1;
  font-size: 0.74rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.all {
  padding: 0.15rem 0.55rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--lv);
  cursor: pointer;
  transition: all 0.2s var(--ease-soft);
}
.all:hover {
  border-color: color-mix(in srgb, var(--lv) 45%, transparent);
  background: color-mix(in srgb, var(--lv) 10%, transparent);
}

/* --- grade de tiles ----------------------------------------------- */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
  gap: 0.55rem;
}

.tile {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  aspect-ratio: 1;
  padding: 0.45rem;

  border: 1.5px solid var(--color-border);
  border-radius: var(--r-md);
  background: var(--color-background-soft);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
  cursor: pointer;

  animation: tile-in 0.4s var(--ease-spring) both;
  animation-delay: calc(var(--i) * 18ms);

  transition:
    transform 0.18s var(--ease-spring),
    border-color 0.25s var(--ease-soft),
    color 0.25s var(--ease-soft),
    box-shadow 0.25s var(--ease-soft);
}

/* Preenchimento que varre na diagonal ao selecionar. */
.sweep {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, var(--lv), color-mix(in srgb, var(--lv) 70%, #000));
  transform: translate(-105%, 105%);
  transition: transform 0.36s var(--ease-ink);
}

/* Kanji do bloco, gigante e apagado, atrás do nome. */
.bg-kanji {
  position: absolute;
  right: -1.25rem;
  bottom: -1.75rem;
  z-index: 1;
  font-family: var(--font-kanji);
  font-size: 5.4rem;
  line-height: 1;
  color: currentColor;
  opacity: 0.14;
  pointer-events: none;
  transition: opacity 0.3s var(--ease-soft);
}

.check {
  position: absolute;
  top: 0.3rem;
  right: 0.4rem;
  z-index: 2;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  opacity: 0;
  transform: scale(0.4);
  transition: all 0.3s var(--ease-spring) 0.12s;
}

.name {
  position: relative;
  z-index: 2;
  font-size: 0.75rem;
  line-height: 1.15;
  text-align: center;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}
.n {
  position: relative;
  z-index: 2;
  font-size: 0.65rem;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

/* --- selecionado --------------------------------------------------- */
.tile.on {
  border-color: var(--lv);
  color: #fff;
  box-shadow: var(--shadow-md);
}
.tile.on .sweep {
  transform: translate(0, 0);
}
.tile.on .bg-kanji {
  opacity: 0.22;
}
.tile.on .check {
  opacity: 1;
  transform: scale(1);
}

.tile:active:not(:disabled) {
  transform: scale(0.95);
}
.tile:disabled {
  cursor: default;
}

@media (hover: hover) {
  .tile:hover:not(.on):not(:disabled) {
    transform: translateY(-2px);
    border-color: var(--lv);
    box-shadow: var(--shadow-md);
  }
  .tile:hover:not(.on):not(:disabled) .bg-kanji {
    opacity: 0.2;
  }
}

/* --- travado (modo ranked) ----------------------------------------- */
.groups.locked .lv,
.groups.locked .count {
  color: var(--color-text);
}
.groups.locked .lv::after {
  background: var(--color-text);
  opacity: 0.3;
}
.groups.locked .tile {
  animation: none;
  opacity: 0.55;
}
.groups.locked .tile,
.groups.locked .tile.on {
  border-color: var(--color-border);
  color: var(--color-text);
  box-shadow: none;
}
.groups.locked .sweep {
  background: var(--color-background-mute);
}
.groups.locked .check {
  color: var(--color-text);
}
</style>

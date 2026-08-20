<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Quiz } from '../composables/useQuiz'
import { useRankings } from '../composables/useRankings'
import { useAuth } from '../composables/useAuth'
import { Size, Color, Align, Variant } from '../composables/useTheme'
import BaseImage from '../components/base/BaseImage.vue'
import BaseText from '../components/base/BaseText.vue'
import BaseButton from '../components/base/BaseButton.vue'

const props = defineProps<{ quiz: Quiz }>()
const q = props.quiz
const { save } = useRankings()
const { isAuthed, user, openLogin } = useAuth()

const saved = ref(false)
const saving = ref(false)
const saveError = ref(false)
const pendingSave = ref(false)

const sticker = computed(() => {
  const p = q.pct.value
  if (p >= 90) return '/eureka.png'
  if (p >= 70) return '/happy.png'
  if (p >= 40) return '/confused.png'
  return '/dead.png'
})

async function saveScore() {
  if (saved.value || saving.value || q.mode.value !== 'ranked') return
  if (!isAuthed.value) {
    pendingSave.value = true
    openLogin()
    return
  }
  saving.value = true
  saveError.value = false
  try {
    await save({
      level: q.level.value,
      correct: q.firstCorrect.value,
      total: q.firstTotal.value,
      points: q.rankedScore.value,
    })
    saved.value = true
  } catch {
    saveError.value = true
  } finally {
    saving.value = false
  }
}

watch(isAuthed, (authed) => {
  if (authed && pendingSave.value) {
    pendingSave.value = false
    saveScore()
  }
})

function finish() {
  q.restart()
  saved.value = false
  saving.value = false
  saveError.value = false
  pendingSave.value = false
}
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <BaseImage class="sticker" :src="sticker" :size="7" />
      <BaseText :size="Size.Lg" :color="Color.Heading" :align="Align.Center">Round complete 🎉</BaseText>
      <BaseText
        v-if="q.mode.value === 'ranked'"
        :size="Size.Xxl"
        :color="Color.Correct"
        :align="Align.Center"
        bold
      >
        {{ q.rankedScore.value }} pts
      </BaseText>
      <BaseText :size="Size.Xs" :color="Color.Text" :align="Align.Center">
        {{ q.firstCorrect.value }}/{{ q.firstTotal.value }} correct · {{ q.pct.value }}%
      </BaseText>
      <BaseText :size="Size.Xs" :color="Color.Text" :align="Align.Center">
        {{ q.level.value }} · {{ q.mode.value === 'ranked' ? 'Ranked' : 'Custom' }}
      </BaseText>

      <BaseText
        v-if="q.hasRetried.value"
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

      <BaseButton v-if="q.canRetry.value" :variant="Variant.Plain" block @click="q.retryIncorrect">
        Retry incorrect ({{ q.incorrectCount.value }})
      </BaseButton>

      <template v-if="q.mode.value === 'ranked'">
        <button
          class="save"
          :class="{ done: saved }"
          :disabled="saved || saving"
          @click="saveScore"
        >
          {{ saved ? 'Saved ✓' : saving ? 'Saving…' : !isAuthed ? 'Log in to save' : saveError ? 'Retry save' : 'Save to ranking' }}
        </button>
        <BaseText v-if="isAuthed && user" :size="Size.Xs" :color="Color.Text" :align="Align.Center">
          Posting as {{ user.username }}
        </BaseText>
        <BaseText v-if="saveError" :size="Size.Xs" :color="Color.Text" :align="Align.Center">
          Couldn't reach the ranking. Try again.
        </BaseText>
      </template>

      <BaseButton :variant="Variant.Plain" block @click="finish">Finish</BaseButton>
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
  background: rgba(0, 0, 0, 0.5);
}
@media (min-width: 48rem) {
  .overlay {
    padding-left: calc(var(--sidebar) + 1rem);
  }
}
.modal {
  width: 100%;
  max-width: 22rem;
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
}
.sticker {
  align-self: center;
}
.save {
  padding: 0.85rem 1.25rem;
  border: 2px solid var(--brand);
  border-radius: 0.9rem;
  background: var(--brand);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}
.save:disabled {
  opacity: 0.5;
  cursor: default;
}
.save.done {
  opacity: 1;
  border-color: var(--ok);
  background: var(--ok);
}
</style>

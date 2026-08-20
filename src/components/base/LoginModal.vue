<script setup lang="ts">
import { ref } from 'vue'
import { useLogin } from '../../composables/useLogin'
import { useAccountCreate } from '../../composables/useAccountCreate'
import { Size, Color, Align } from '../../composables/useTheme'
import BaseText from './BaseText.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const mode = ref<'login' | 'create'>('login')

const {
  username: loginUsername,
  password: loginPassword,
  loading: loginLoading,
  error: loginError,
  submit: loginSubmit,
} = useLogin()

const {
  username: createUsername,
  password: createPassword,
  loading: createLoading,
  error: createError,
  submit: createSubmit,
} = useAccountCreate()

async function onSubmit() {
  const ok = mode.value === 'login' ? await loginSubmit() : await createSubmit()
  if (ok) emit('close')
}
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="tabs">
        <button class="tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">Log in</button>
        <button class="tab" :class="{ active: mode === 'create' }" @click="mode = 'create'">Create account</button>
      </div>

      <form v-if="mode === 'login'" class="form" @submit.prevent="onSubmit">
        <input v-model="loginUsername" class="input" type="text" placeholder="Username" autocomplete="username" autocapitalize="off" />
        <input v-model="loginPassword" class="input" type="password" placeholder="Password" autocomplete="current-password" />
        <BaseText v-if="loginError" :size="Size.Xs" :color="Color.Text" :align="Align.Center">{{ loginError }}</BaseText>
        <button class="submit" type="submit" :disabled="loginLoading || !loginUsername.trim() || !loginPassword">
          {{ loginLoading ? 'Signing in…' : 'Log in' }}
        </button>
      </form>

      <form v-else class="form" @submit.prevent="onSubmit">
        <input v-model="createUsername" class="input" type="text" placeholder="Username (3–20, letters/numbers)" autocomplete="username" autocapitalize="off" maxlength="20" />
        <input v-model="createPassword" class="input" type="password" placeholder="Password" autocomplete="new-password" />
        <BaseText v-if="createError" :size="Size.Xs" :color="Color.Text" :align="Align.Center">{{ createError }}</BaseText>
        <button class="submit" type="submit" :disabled="createLoading || !createUsername.trim() || !createPassword">
          {{ createLoading ? 'Creating…' : 'Create account' }}
        </button>
      </form>

      <button class="cancel" @click="emit('close')">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
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
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.tabs {
  display: flex;
  gap: 0.5rem;
}
.tab {
  flex: 1;
  padding: 0.6rem;
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
}
.tab.active {
  border-color: var(--brand);
  color: var(--color-heading);
  font-weight: 600;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.input {
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 0.9rem;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font-size: 1rem;
}
.input:focus {
  outline: none;
  border-color: var(--brand);
}
.submit {
  padding: 0.85rem 1.25rem;
  border: 2px solid var(--brand);
  border-radius: 0.9rem;
  background: var(--brand);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}
.submit:disabled {
  opacity: 0.5;
  cursor: default;
}
.cancel {
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
}
</style>

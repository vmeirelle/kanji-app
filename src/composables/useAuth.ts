import { computed, ref } from 'vue'
import * as storage from '../storage'
import { authService, type AuthResponse, type AuthUser } from '../services/AuthService'

const TOKEN_KEY = 'kanji-auth-token.v1'

const token = ref<string | null>(storage.load<string>(TOKEN_KEY))
const user = ref<AuthUser | null>(null)
const promptOpen = ref(false)

export function useAuth() {
  const isAuthed = computed(() => Boolean(token.value))

  const setSession = (auth: AuthResponse) => {
    token.value = auth.token
    user.value = auth.user
    storage.save(TOKEN_KEY, auth.token)
  }

  const logout = () => {
    token.value = null
    user.value = null
    storage.remove(TOKEN_KEY)
  }

  const restore = async () => {
    if (!token.value) return
    try {
      user.value = await authService.me(token.value)
    } catch {
      logout()
    }
  }

  const openLogin = () => {
    promptOpen.value = true
  }

  const closeLogin = () => {
    promptOpen.value = false
  }

  return { token, user, isAuthed, promptOpen, setSession, logout, restore, openLogin, closeLogin }
}

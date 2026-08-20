import { ref } from 'vue'
import { useAuth } from './useAuth'
import { useProfileSync } from './useProfileSync'
import { authService } from '../services/AuthService'
import { ApiError } from '../services/HttpClient'

export function useLogin() {
  const { setSession } = useAuth()
  const { onLoggedIn } = useProfileSync()
  const username = ref('')
  const password = ref('')
  const loading = ref(false)
  const error = ref('')

  const submit = async (): Promise<boolean> => {
    if (loading.value) return false
    loading.value = true
    error.value = ''
    try {
      const auth = await authService.login(username.value.trim(), password.value)
      setSession(auth)
      await onLoggedIn()
      return true
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Could not sign in'
      return false
    } finally {
      loading.value = false
    }
  }

  return { username, password, loading, error, submit }
}

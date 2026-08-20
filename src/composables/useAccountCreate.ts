import { ref } from 'vue'
import { useAuth } from './useAuth'
import { authService } from '../services/AuthService'
import { ApiError } from '../services/HttpClient'

export function useAccountCreate() {
  const { setSession } = useAuth()
  const username = ref('')
  const password = ref('')
  const loading = ref(false)
  const error = ref('')

  const submit = async (): Promise<boolean> => {
    if (loading.value) return false
    loading.value = true
    error.value = ''
    try {
      const auth = await authService.register(username.value.trim(), password.value)
      setSession(auth)
      return true
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Could not create the account'
      return false
    } finally {
      loading.value = false
    }
  }

  return { username, password, loading, error, submit }
}

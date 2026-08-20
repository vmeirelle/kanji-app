import { ref } from 'vue'
import { API_BASE } from '../services/config'

type Status = 'online' | 'offline' | 'checking'

const status = ref<Status>('online')
const dismissed = ref(false)

export function reportOnline() {
  status.value = 'online'
}

export function reportOffline() {
  if (status.value === 'checking') return
  status.value = 'offline'
  dismissed.value = false
}

export function useServerStatus() {
  const check = async () => {
    status.value = 'checking'
    try {
      const res = await fetch(`${API_BASE}/api/health`)
      status.value = res.ok ? 'online' : 'offline'
    } catch {
      status.value = 'offline'
    }
  }

  const dismiss = () => {
    dismissed.value = true
  }

  return { status, dismissed, check, dismiss }
}

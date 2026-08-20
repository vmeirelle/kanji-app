import { watch } from 'vue'
import { useAuth } from './useAuth'
import { useSettings, hydrateSettings, type Settings } from './useSettings'
import { useQuiz } from './useQuiz'
import { setSaved, type SavedLesson } from '../saved'
import { stateService } from '../services/StateService'

type ProfileState = {
  settings?: Partial<Settings>
  saved?: SavedLesson[]
}

let autoStarted = false

export function useProfileSync() {
  const { token } = useAuth()
  const settings = useSettings()
  const q = useQuiz()

  const gather = (): ProfileState => ({ settings: { ...settings }, saved: q.savedLessons.value })

  const push = async () => {
    if (!token.value) return
    try {
      await stateService.save(token.value, gather())
    } catch {
      void 0
    }
  }

  const apply = (state: ProfileState) => {
    if (state.settings) hydrateSettings(state.settings)
    if (state.saved) {
      setSaved(state.saved)
      q.reloadSaved()
    }
  }

  const onRegistered = async () => {
    await push()
  }

  const onLoggedIn = async () => {
    if (!token.value) return
    let state: ProfileState | null = null
    try {
      state = (await stateService.get(token.value)) as ProfileState | null
    } catch {
      return
    }
    if (state && (state.settings || state.saved)) apply(state)
    else await push()
  }

  const startAutoSync = () => {
    if (autoStarted) return
    autoStarted = true
    let timer: ReturnType<typeof setTimeout> | null = null
    watch(
      () => JSON.stringify(gather()),
      () => {
        if (!token.value) return
        if (timer) clearTimeout(timer)
        timer = setTimeout(push, 800)
      },
    )
  }

  return { onRegistered, onLoggedIn, startAutoSync }
}

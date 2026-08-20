import { reactive, watchEffect } from 'vue'
import * as storage from '../storage'

export type AutoSound = 'never' | 'fail' | 'all'
export type JpFont = 'both' | 'kanji' | 'none'
export type Theme = 'system' | 'light' | 'dark'

export type Settings = {
  autoSound: AutoSound
  jpFont: JpFont
  noLevelColors: boolean
  noMotion: boolean
  theme: Theme
}

const KEY = 'kanji-settings.v1'
const KLEE = "'Klee One', 'Noto Serif JP', serif"
const DEFAULTS: Settings = {
  autoSound: 'never',
  jpFont: 'kanji',
  noLevelColors: false,
  noMotion: false,
  theme: 'system',
}

function apply(s: Settings) {
  const root = document.documentElement
  if (s.theme === 'system') root.removeAttribute('data-theme')
  else root.dataset.theme = s.theme
  root.classList.toggle('no-lv', s.noLevelColors)
  root.classList.toggle('no-motion', s.noMotion)
  root.style.setProperty('--font-kanji', s.jpFont === 'none' ? 'inherit' : KLEE)
  root.style.setProperty('--font-kana', s.jpFont === 'both' ? KLEE : 'inherit')
}

let instance: Settings | null = null

export function useSettings(): Settings {
  if (!instance) {
    instance = reactive({ ...DEFAULTS, ...(storage.load<Partial<Settings>>(KEY) ?? {}) })
    watchEffect(() => {
      apply(instance!)
      storage.save(KEY, { ...instance })
    })
  }
  return instance
}

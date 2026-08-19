const KEY = 'kanji-quiz-state.v2'

/** Persist any JSON-serializable value under a single localStorage key. */
export function load<T>(): T | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function save<T>(state: T): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / privacy-mode failures */
  }
}

export function clear(): void {
  localStorage.removeItem(KEY)
}

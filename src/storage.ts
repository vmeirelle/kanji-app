/** Tiny JSON-in-localStorage helpers, keyed so any feature can reuse them. */
export function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / privacy-mode failures */
  }
}

export function remove(key: string): void {
  localStorage.removeItem(key)
}

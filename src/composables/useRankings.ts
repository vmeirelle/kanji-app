import { ref } from 'vue'
import { loadRankings, addRanking, points, type Ranking } from '../rankings'

// Single shared rankings list: the result screen writes it, the ranking view reads it.
// Backed by a global store (Supabase), so it loads asynchronously.
const rankings = ref<Ranking[]>([])
const loading = ref(false)
const error = ref(false)

export function useRankings() {
  // Fetch the current global board. Called each time the ranking view opens.
  const refresh = async () => {
    loading.value = true
    error.value = false
    try {
      rankings.value = await loadRankings()
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  const save = async (entry: Ranking) => {
    // Optimistic: show the player's own score immediately, roll back if the write fails.
    const prev = rankings.value
    rankings.value = [...prev, entry].sort((a, b) => points(b) - points(a))
    try {
      await addRanking(entry)
    } catch (e) {
      rankings.value = prev
      throw e
    }
  }

  return { rankings, loading, error, refresh, save }
}

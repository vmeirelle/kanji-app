import { ref } from 'vue'
import { loadRankings, addRanking, points, type Ranking } from '../rankings'

const rankings = ref<Ranking[]>([])
const loading = ref(false)
const error = ref(false)

export function useRankings() {
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

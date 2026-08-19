import { ref } from 'vue'
import { loadRankings, addRanking, type Ranking } from '../rankings'

// Single shared rankings list: the result screen writes it, the ranking view reads it.
const rankings = ref<Ranking[]>([])
let loaded = false

export function useRankings() {
  if (!loaded) {
    rankings.value = loadRankings()
    loaded = true
  }

  const save = (entry: Ranking) => {
    rankings.value = addRanking(entry)
  }

  return { rankings, save }
}

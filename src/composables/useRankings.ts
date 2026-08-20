import { ref } from 'vue'
import { points, today, type Ranking } from '../rankings'
import { rankingService, type RankingItem, type ScoreInput } from '../services/RankingService'
import { useAuth } from './useAuth'

const rankings = ref<Ranking[]>([])
const loading = ref(false)
const error = ref(false)

function toRanking(item: RankingItem): Ranking {
  return {
    name: item.username,
    level: item.level,
    correct: item.correct,
    total: item.total,
    points: item.points,
    day: item.day,
    date: item.date,
  }
}

export function useRankings() {
  const { token, user } = useAuth()

  const refresh = async () => {
    loading.value = true
    error.value = false
    try {
      rankings.value = (await rankingService.list()).map(toRanking)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  const save = async (score: ScoreInput): Promise<void> => {
    if (!token.value || !user.value) throw new Error('Not authenticated')

    const optimistic: Ranking = {
      name: user.value.username,
      level: score.level,
      correct: score.correct,
      total: score.total,
      points: score.points,
      day: today(),
      date: new Date().toISOString(),
    }
    const prev = rankings.value
    rankings.value = [...prev, optimistic].sort((a, b) => points(b) - points(a))
    try {
      await rankingService.submit(token.value, score)
    } catch (e) {
      rankings.value = prev
      throw e
    }
  }

  return { rankings, loading, error, refresh, save }
}

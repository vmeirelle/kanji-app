// Thin wrapper over Supabase's REST (PostgREST) API. No SDK dependency: the app
// stays vue-only. The anon key is public by design — RLS on the `rankings` table
// restricts anon to INSERT + SELECT.
import type { Ranking } from './rankings'

const URL = import.meta.env.VITE_SUPABASE_URL
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

export const configured = Boolean(URL && ANON)

const endpoint = `${URL}/rest/v1/rankings`
const headers = {
  apikey: ANON,
  Authorization: `Bearer ${ANON}`,
  'Content-Type': 'application/json',
}

export async function fetchRankings(): Promise<Ranking[]> {
  const res = await fetch(`${endpoint}?select=name,level,correct,total,points,day,date&order=points.desc`, {
    headers,
  })
  if (!res.ok) throw new Error(`fetch rankings failed: ${res.status}`)
  return (await res.json()) as Ranking[]
}

export async function insertRanking(entry: Ranking): Promise<void> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(entry),
  })
  if (!res.ok) throw new Error(`insert ranking failed: ${res.status}`)
}

# Global Leaderboard Design

**Date:** 2026-08-20

## Goal

Turn the currently-local ranking board into a **global, shared leaderboard** visible to
everyone who uses the deployed app. **Settings stay local** (`localStorage`, untouched).
Only rankings move to a shared store.

## Backend

Supabase (free tier). One table mirroring the existing `Ranking` type.

Table `rankings`:

| column   | type        | notes                       |
|----------|-------------|-----------------------------|
| id       | uuid        | primary key, default gen    |
| name     | text        | <= 20 chars                 |
| level    | text        | must be an allowed level    |
| correct  | int         | >= 0                        |
| total    | int         | >= 0                        |
| points   | int         | 0 <= points <= 100000       |
| day      | date        | used by the day-nav filter  |
| date     | timestamptz | full timestamp              |

**RLS (Basic integrity):** anon may `INSERT` and `SELECT` only. No `UPDATE`/`DELETE`.
Check constraints enforce name length, points range, non-negative counts.

## App changes

- `src/supabase.ts` (new): reads `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; exposes
  `insertRanking(entry)` and `fetchRankings()` using plain `fetch` against the Supabase
  REST (PostgREST) API. **No new npm dependency.**
- `src/rankings.ts`: `loadRankings()` and `addRanking()` become **async** network calls.
  `Ranking` type unchanged. Keep `today`/`addDays`/`points` helpers.
- `src/composables/useRankings.ts`: add `loading` and `error` refs and a `refresh()`
  function. Load on demand rather than eagerly.
- `src/views/RankingView.vue`: show a spinner while `loading`; call `refresh()` each time
  the view opens so it always shows current global scores. Show a friendly error state on
  fetch failure.
- `src/views/QuizResult.vue`: `save()` inserts to Supabase and optimistically adds the new
  entry to the local list so the player's own score appears instantly.

## Config & secrets

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`:
- local `.env` (gitignored) for `npm run dev`
- GitHub repo secrets injected into the deploy workflow at build time.

The anon key is public by design (protected by RLS); exposing it in the built bundle is
expected and safe.

## Failure handling

Network failure on read -> Ranking view shows a "couldn't load scores" message, no crash.
Failure on insert -> retryable notice. Settings/quiz keep working offline (local).

## Non-goals (YAGNI)

- No accounts/login.
- No real-time subscriptions (fetch on open is enough).
- No offline cache of the global board.

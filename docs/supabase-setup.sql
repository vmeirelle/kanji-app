-- Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run.
-- Creates the global leaderboard table with "Basic" integrity:
-- anyone may INSERT and SELECT; nobody may UPDATE or DELETE; values are sanity-checked.

create table if not exists public.rankings (
  id      uuid primary key default gen_random_uuid(),
  name    text        not null check (char_length(name) between 1 and 20),
  level   text        not null check (char_length(level) between 1 and 16),
  correct int         not null check (correct >= 0),
  total   int         not null check (total >= 0),
  points  int         not null check (points between 0 and 100000),
  day     date        not null,
  date    timestamptz not null default now()
);

-- Fast reads for the board (ordered by points, filtered by day).
create index if not exists rankings_day_points_idx on public.rankings (day, points desc);

-- Row-level security: lock down to insert + read only.
alter table public.rankings enable row level security;

create policy "anon can read rankings"
  on public.rankings for select
  to anon
  using (true);

create policy "anon can insert rankings"
  on public.rankings for insert
  to anon
  with check (true);

-- No UPDATE or DELETE policies exist, so those are denied for anon by default.

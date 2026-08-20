# Accounts + Backend Design (Clean Architecture)

**Date:** 2026-08-20

## Goal

Add username/password accounts (no email — closed beta) and move the leaderboard behind a
proper backend. A score is tied to the logged-in account; the account username is the name
shown on the board. Login/create is a single frontend modal.

## Stack

- **Backend:** TypeScript, **Hono** (HTTP), **Prisma** (ORM), **MySQL**.
- **Auth:** `argon2` password hashing, JWT access token (7-day expiry, no refresh).
- **Frontend:** existing Vue app gains a login/register modal + `useAuth` composable + an
  API client.

No live DB yet — build schema, migrations, and code so it runs once `DATABASE_URL` +
`JWT_SECRET` are set. Connection/hosting decided later.

## Clean Architecture layers (dependency rule points inward)

```
interfaces/http  ->  application (use-cases + ports)  ->  domain (entities + repo interfaces)
infrastructure  ---- implements ---->  application/domain interfaces
```

- **domain/**: pure entities (`User`, `Ranking`), repository interfaces (ports), domain errors.
  Zero framework imports.
- **application/**: use cases (`RegisterUser`, `LoginUser`, `GetMe`, `SubmitScore`,
  `ListRankings`), port interfaces (`PasswordHasher`, `TokenService`), DTOs. Depends only on
  domain. No Hono, no Prisma.
- **infrastructure/**: adapters — `PrismaUserRepository`, `PrismaRankingRepository`,
  `Argon2PasswordHasher`, `JwtTokenService`, prisma client, env config.
- **interfaces/http/**: controllers, routes, middleware (auth, error). Translates HTTP <->
  use-case calls.
- **main.ts**: composition root. Instantiates adapters, injects them into use cases, injects
  use cases into controllers, mounts routes, starts the server.

## Data model (Prisma / MySQL)

```
User    { id, username @unique, passwordHash, createdAt }
Ranking { id, userId -> User, level, correct, total, points, day, date, createdAt }
```

No email. No free-text name. Leaderboard name = `user.username`.

## API

| method | route            | auth | purpose                                    |
|--------|------------------|------|--------------------------------------------|
| POST   | /auth/register   | -    | create account (username + password)       |
| POST   | /auth/login      | -    | returns JWT + user                         |
| GET    | /auth/me         | JWT  | current user                               |
| GET    | /rankings        | -    | public board; filter by day/level          |
| POST   | /rankings        | JWT  | submit score; server stamps name=username  |

Validation via zod at the controller boundary. Errors mapped to HTTP by error middleware.

## Frontend additions

- `LoginModal.vue`: one modal, toggle Login / Create account (username + password only).
- `useAuth.ts`: stores JWT in localStorage; exposes `user`, `login`, `register`, `logout`.
- `src/api.ts`: calls backend at `VITE_API_URL`; replaces `src/supabase.ts` for rankings.
- `QuizResult`: "Save to ranking" requires login (opens modal if logged out); no name field.

## Sequencing (don't break the live site)

1. **Now:** full backend (domain/application/infrastructure/interfaces, schema, migrations)
   + frontend `LoginModal` + `useAuth` as self-contained pieces.
2. **Cutover (later, once backend is deployed with a DB):** switch the frontend ranking
   read/write from Supabase (`src/supabase.ts`) to `src/api.ts`. Until then the live
   Supabase leaderboard keeps working untouched.

## Non-goals (YAGNI)

- No email, password reset, or email verification.
- No refresh tokens / rotation (single access token for beta).
- No roles/permissions beyond "logged in".
- No social login.

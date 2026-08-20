# Accounts + Backend Design (Clean Architecture)

**Date:** 2026-08-20

## Goal

Username/password accounts (no email — closed beta) and the leaderboard behind a proper
backend. A score is tied to the logged-in account; the account username is the board name.
Login/create is a single frontend modal.

## Stack (modeled on the `mypage-backend` reference project)

- **Express** (404 fallback) + a custom `HttpServer` gateway with `@Route/@Get/@Post`.
- **TypeORM + MySQL**, **tsyringe** DI, **ts-results** (`Result<Ok,Err>`, no throwing).
- **zod** via a `@ValidateForm` decorator; **jsonwebtoken**; **md5** hashing.
- Password: SHA-256 on the frontend, MD5 on the backend (behind `IHashService`).

No live DB yet — TypeORM `synchronize` creates tables in dev once env is set.

## Layers (dependency rule points inward)

`InterfaceAdapters → AplicationBusiness → EnterpriseBusiness`, with `Main` as the
composition root. See `server/ARCHITECTURE.md` for the full layer map.

- **EnterpriseBusiness**: entities (`User`, `Ranking`, base `Entity`, `Id`), `TagError`
  errors, use-case contracts (`UseCase<Form,Res,Errors>` + `I*UseCase` + Form/Result/Errors).
- **AplicationBusiness**: use-case implementations, `I*Repository`/`I*Service` ports,
  `validators`, `@ValidateForm`.
- **InterfaceAdapters**: TypeORM repos + models, `HashService`/`TokenService`, HTTP gateway,
  `*HttpApiController` returning `HttpResult`.
- **Main**: `ContainerAdapter`, `HashAdapter`, `JwtAdapter`, `HttpServerAdapter`, DI
  registrations, TypeORM DataSource.

## Data model (TypeORM / MySQL)

```
users    { id, username @unique, password_hash, created_at }
rankings { id, user_id -> users, level, correct, total, points, day, date, created_at }
```

## API

| Method | Path                 | Auth | Body / Query                          |
|--------|----------------------|------|---------------------------------------|
| POST   | /api/auth/register   | -    | { username, password }                |
| POST   | /api/auth/login      | -    | { username, password }                |
| GET    | /api/auth/me         | JWT  | -                                     |
| GET    | /api/rankings        | -    | ?day=YYYY-MM-DD&level=                 |
| POST   | /api/rankings        | JWT  | { level, correct, total, points }     |

`POST /api/rankings` stamps day/date server-side and takes the user id from the JWT.

## Frontend additions (phase 2, not built yet)

- `LoginModal.vue` (username + password, Login / Create toggle), `useAuth.ts`, `src/api.ts`.
- Cutover ranking read/write from Supabase to the new API once the backend is deployed.

## Status

Backend built and type-checks clean (`npm run type-check`, exit 0). No DB wired yet.
Frontend modal + cutover pending.

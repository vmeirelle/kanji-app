# Server Architecture

Clean architecture. Dependencies point inward only. Inner layers never import outer ones.

```
interfaces/http  →  application  →  domain
        ▲               ▲             ▲
        └──────── infrastructure ─────┘   (implements the interfaces above)
```

## Layers

### domain (`src/domain`)
The core. Pure TypeScript, zero framework or library imports.
- `entities/` — `User`, `Ranking`: models plus the little behavior they own.
- `repositories/` — persistence interfaces (`UserRepository`, `RankingRepository`). Ports the domain defines and the outside implements.
- `errors/` — `DomainError` subclasses with a `code`; the HTTP layer maps codes to statuses.

### application (`src/application`)
Business rules expressed as use cases. Depends only on `domain`. No Hono, no Prisma.
- `use-cases/` — one interface + one implementation each: `RegisterUser`, `LoginUser`, `GetMe`, `SubmitScore`, `ListRankings`.
- `ports/` — interfaces for capabilities the use cases need: `PasswordHasher`, `TokenService`.
- `dtos/` — plain input/output shapes for use cases.

### infrastructure (`src/infrastructure`)
Adapters that implement the interfaces from `domain` and `application`.
- `repositories/` — `PrismaUserRepository`, `PrismaRankingRepository`.
- `security/` — `Md5PasswordHasher`, `JwtTokenService`.
- `db/` — Prisma client factory.
- `config/` — zod-validated environment loading.

### interfaces/http (`src/interfaces/http`)
The delivery mechanism (Hono). Translates HTTP to use-case calls and back.
- `controllers/` — one interface + one implementation each. Validate the request body/query with zod, call a use case, return a typed response.
- `contracts/` — request schemas and response types. The typed boundary of the API.
- `routes/` — map paths to controller methods; attach auth middleware.
- `middleware/` — `auth` (verify JWT → set `userId`), `error` (map errors to HTTP).

## Composition root (`src/main.ts`)
The only place that knows every concrete class. It instantiates adapters, injects them into use cases, injects use cases into controllers, mounts routes, and starts the server. Swapping an adapter (e.g. `Md5PasswordHasher` → an argon2 hasher, or Prisma → another ORM) is a one-line change here and nothing else moves.

## API

| Method | Path             | Auth | Body / Query                          | Response            |
|--------|------------------|------|---------------------------------------|---------------------|
| POST   | `/auth/register` | –    | `{ username, password }`              | `{ user, token }`   |
| POST   | `/auth/login`    | –    | `{ username, password }`              | `{ user, token }`   |
| GET    | `/auth/me`       | JWT  | –                                     | `{ id, username, createdAt }` |
| GET    | `/rankings`      | –    | `?day=YYYY-MM-DD&level=`              | `{ rankings: [...] }` |
| POST   | `/rankings`      | JWT  | `{ level, correct, total, points }`   | `{ ranking }`       |

`POST /rankings` stamps `day` and `date` server-side and derives the leaderboard name from the authenticated user — the client cannot spoof either.

## Password hashing

Per project decision: SHA-256 on the frontend, MD5 on the backend (`Md5PasswordHasher`). This storage is fast and unsalted and would not withstand a database leak. It is isolated behind the `PasswordHasher` port so it can be replaced by a salted, slow hash (argon2/bcrypt) without touching any use case.

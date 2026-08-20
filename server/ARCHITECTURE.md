# Server Architecture

Clean Architecture, modeled on the `mypage-backend` reference. Four layers, dependencies point inward. Errors flow as `ts-results` `Result<Ok, Err>` — no throwing across layers. Dependency injection via tsyringe.

```
InterfaceAdapters  →  AplicationBusiness  →  EnterpriseBusiness
        │                    │                      │
        └───────────  Main (composition)  ──────────┘
```

## Layers

### EnterpriseBusiness (`src/EnterpriseBusiness`)
Enterprise rules. No framework imports.
- `entities/` — `User`, `Ranking`, base `Entity`, `objectValues/Id`.
- `errors/` — `TagError` base (each error one file, carries a `tag`), plus `form/FormError`, `token/*`.
- `useCases/` — use-case **contracts**: `useCase.ts` (`UseCase<Form, Res, Errors>`), and per feature the `Form` / `Result` / `Errors` types + the `I*UseCase` alias.

### AplicationBusiness (`src/AplicationBusiness`)
Application rules. Depends only on EnterpriseBusiness.
- `useCases/` — use-case **implementations** (`@injectable`, `@inject` deps), guarded by `@ValidateForm`.
- `repository/` — `I*Repository` ports.
- `services/` — `IHashService`, `ITokenService` ports.
- `validators/` — zod builders. `decorators/ValidateForm.ts` — validates the form, returns `Err(FormError)` on failure.

### InterfaceAdapters (`src/InterfaceAdapters`)
Adapters implementing the ports.
- `repository/` — TypeORM `UserRepository`, `RankingRepository` + `models/main/*Model`.
- `services/` — `HashService`, `TokenService`.
- `adapters/` — port interfaces (`IHashAdapter`, `ITokenAdapter`, `IHttpServerAdapter`, `IContainerAdapter`).
- `gateway/http/` — the `HttpServer` gateway + `@Route/@Get/@Post` decorators + `Http.types`.
- `controllers/http/` — `HttpController` base (error → HTTP mapping) and the `*HttpApiController`s. Each endpoint returns an `HttpResult`.

### Main (`src/Main`)
Frameworks & wiring.
- `adapters/` — `ContainerAdapter` (tsyringe), `HashAdapter` (md5), `JwtAdapter` (jsonwebtoken), `HttpServerAdapter` (node http).
- `container/` — DI registrations: `services`, `repositories`, `useCases`, `database` (TypeORM DataSource + `initDatabase`).

### Entry points
- `src/main.ts` — `startCleanArchitecture`: resolves use cases from the container, builds controllers, registers them on the `HttpServer`.
- `src/server.ts` — boots the DB, creates the node http server, routes requests through the gateway, express as 404 fallback.

## Stack
Express (fallback) · custom `HttpServer` gateway · TypeORM + MySQL · tsyringe · ts-results · zod (via `@ValidateForm`) · jsonwebtoken · md5.

## API

| Method | Path             | Auth | Body / Query                          | Success |
|--------|------------------|------|---------------------------------------|---------|
| POST   | `/api/auth/register` | –  | `{ username, password }`              | 201 `{ user, token }` |
| POST   | `/api/auth/login`    | –  | `{ username, password }`              | 200 `{ user, token }` |
| GET    | `/api/auth/me`       | JWT | –                                    | 200 `{ id, username, createdAt }` |
| GET    | `/api/rankings`      | –  | `?day=YYYY-MM-DD&level=`              | 200 `{ rankings }` |
| POST   | `/api/rankings`      | JWT | `{ level, correct, total, points }`  | 201 `{ ranking }` |

`POST /api/rankings` stamps `day`/`date` server-side and takes the user id from the JWT — the client cannot spoof score name or date.

## Password hashing
Per project decision: SHA-256 on the frontend, MD5 on the backend (`HashAdapter.md5`). Fast and unsalted — it would not withstand a DB leak. Isolated behind `IHashService` / `IHashAdapter`, so swapping to a salted slow hash (argon2/bcrypt) touches only the adapter.

# Yomi — Kanji Study

Timed kanji & kana practice with ranked rounds and a global leaderboard.

**Live:** https://kanji-app-9ks.pages.dev

## Stack

- **Frontend** — Vue 3 + Vite (TypeScript), static.
- **Backend** — Express + TypeORM, Clean Architecture (ts-results, tsyringe, JWT auth).
- **Database** — MySQL.

## Layout

```
src/       Vue frontend — views, components, composables, services
server/    TypeScript API — Clean Architecture (see server/ARCHITECTURE.md)
```

## Run locally

Frontend:

```
npm install
npm run dev            # http://localhost:5173
```

Backend:

```
cd server
cp .env.example .env   # fill in DB + JWT values
npm install
npm run dev            # http://localhost:3000
```

Set `VITE_API_URL` in a root `.env.local` to point the frontend at your local API.

## Deploy (developers)

Hot deploy: **push to `main` and both halves redeploy automatically.** No manual steps.

- **Frontend → Cloudflare Pages** — repo connected once. Build `npm run build`, output `dist`. Free tier.
- **Backend → Render** — repo connected once. Root dir `server`, build `npm ci --include=dev && npm run build`, start `npm start`. Free tier (sleeps when idle; first request after idle is slow).
- **Database → MySQL (TiDB Cloud Serverless)** — free tier. Tables auto-create on first boot via TypeORM.

Every provider reads its config from **environment variables set in its own dashboard** (never committed):

- **Backend:** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`, `JWT_SECRET`, `JWT_EXPIRATION_SECONDS`, `CORS_ORIGINS`. See `server/.env.example`.
- **Frontend:** `VITE_API_URL` (optional — the API base is also defaulted in code).

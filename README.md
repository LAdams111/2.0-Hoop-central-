# Hoop Central

Basketball analytics platform: React frontend + Node/Express API + PostgreSQL.

## Run locally

1. **Backend** (API + optional SPA in production mode):
   ```bash
   npm install
   cp .env.example .env   # add DATABASE_URL etc.
   npm start
   ```
   Uses `PORT` (default 3000). In development, only the API and a simple root message are served.

2. **Frontend** (dev with hot reload):
   ```bash
   cd frontend && npm install && npm run dev
   ```
   Vite proxies `/api` to `http://localhost:3000`.

3. **Database** (PostgreSQL):
   ```bash
   npm run db:create
   npm run db:schema
   # or: npm run db:migrate
   ```

## Deploy on Railway

1. **GitHub**: Push this repo to your GitHub account (see below).

2. **Railway**: [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → Select this repo.

3. **Variables**: In the Railway service, add:
   - `NODE_ENV` = `production` (so the server serves the built SPA and API)
   - `DATABASE_URL` = your Postgres connection string (add a Postgres plugin or external URL)

4. **Build**: Railway uses `railway.json`: runs `npm install && npm run build` (installs root + frontend deps, builds frontend), then `npm start`.

5. **Domain**: In Railway, add a public domain to the service to get a URL.

## Repo layout

- `server.js` – Express app; mounts `/api`, serves `frontend/dist` in production
- `api/routes.js` – API routes (players, leagues, teams, scraper, etc.)
- `frontend/` – Vite + React + TypeScript SPA
- `db/` – Schema and migrations
- `services/`, `scrapers/`, `jobs/` – Backend logic

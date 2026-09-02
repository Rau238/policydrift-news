# Host the **backend** on Render

Same layout as [RAILWAY.md](./RAILWAY.md): the API is **`backend/`** (Express, no TypeScript compile).

## Fix: `Missing script: "build"`

Render’s Node flow often runs **`npm run build`**. This repo’s API is plain JavaScript, but **`backend/package.json` includes a no-op `build` script** so that step succeeds. Redeploy after pulling the latest `backend/package.json`.

## Suggested Render settings

| Setting | Value |
|--------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` (default) or `npm ci` |
| **Start Command** | `npm start` |

If you use a **monorepo** from the repo root:

- **Build Command** might be `npm install && npm run build -w newsfree365-backend`  
  or `cd backend && npm install && npm run build`.

## Environment variables

Same idea as Railway: MySQL (`MYSQL_HOST` or `MYSQLHOST`, etc.), **`CORS_ORIGIN`**, **`PORT`** is set by Render (do not pin **`API_PORT`** unless you know you need it). See [RAILWAY.md](./RAILWAY.md) and [VERCEL_PRODUCTION_API.md](./VERCEL_PRODUCTION_API.md).

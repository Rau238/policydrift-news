# PolicyDrift

Full-stack news platform: **Node.js + Express**, **MySQL**, **Next.js 14 (App Router)**, **Tailwind CSS**.

- Pulls articles from **RSS feeds**, **rewrites** them into SEO-oriented HTML (OpenAI optional; fallback templates if no key).
- Persists posts in **MySQL** with **unique slugs** and **URL-hash deduplication**.
- **REST API** (MVC layout, **connection pooling**).
- **Cron** runs ingestion **every 30 minutes**.
- Frontend: **home**, **/blog** with **category filters** and pagination, **/blog/[slug]** with SSR, **trending** sidebar, **meta tags**, **NewsArticle JSON-LD**, **sitemap** and **robots.txt**.

## Folder structure

```
policydrift-news/
├── backend/
│   ├── package.json
│   ├── sql/schema.sql          # DB `policydrift` + `posts` table
│   ├── sql/table-posts.sql     # `posts` only (use your existing DB name in Workbench)
│   └── src/
│       ├── server.js           # HTTP server + cron
│       ├── app.js              # Express app
│       ├── config/env.js
│       ├── config/rss-feeds.js   # RSS URLs by category (Breaking, India, …)
│       ├── db/pool.js          # mysql2 pool
│       ├── models/post.model.js
│       ├── controllers/post.controller.js
│       ├── routes/post.routes.js
│       ├── routes/meta.routes.js
│       ├── services/
│       │   ├── rss.service.js
│       │   ├── rewrite.service.js
│       │   └── ingestion.service.js
│       └── utils/hash.js
├── frontend/                   # Next.js 14
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   └── lib/
├── scripts/
│   ├── web-dev.mjs             # next dev -p $WEB_PORT
│   └── web-start.mjs           # next start -p $WEB_PORT
├── package.json                # npm workspaces + dev script
├── .env.example
└── README.md
```

**Full step-by-step setup (install MySQL, `.env`, verify DB, run ingest):** see **[SETUP.md](./SETUP.md)**.

## Prerequisites

- Node.js 18+
- MySQL 8 (or compatible)

## Setup

### 1. Database

Create the schema (adjust database name if needed):

```bash
mysql -u root -p < backend/sql/schema.sql
```

### 2. Environment (development + production)

Copy the example into both env files at the **repository root**:

```bash
cp .env.example .env.development
cp .env.example .env.production
```

| File | Used by |
|------|---------|
| `.env.development` | `npm run dev`, `npm run build:dev`, local ingest |
| `.env.production` | `npm run build` / `build:prod`, `npm run start`, PM2 |

Set `MYSQL_*`, ports, and URLs per environment:

- **Development:** API `http://localhost:4001`, web `http://localhost:3001`
- **Production:** API/web ports `4000` / `3000` (or reverse proxy); `NEXT_PUBLIC_*` = live domain (e.g. `https://www.policydrift.live`)

Optional shared overrides can go in root `.env` (loaded first; env-specific files win).

### 3. Install dependencies

From the repo root:

```bash
npm install
```

### 4. Run in development

Terminal A + B, or one command:

```bash
npm run dev
```

- API: `http://localhost:<API_PORT>` (default **4000**) — health: `GET /health`
- Web: `http://localhost:<WEB_PORT>` (default **3000**)

### 5. First content load (RSS → MySQL)

Set **`RSS_FEED_URLS`** in `.env`, then either:

```bash
npm run ingest
```

or with the API running: `POST /api/posts/ingest` (see SETUP.md).

After that, the **cron** job (every **30 minutes**) will ingest new items automatically unless `CRON_ENABLED=false`.

## API reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |
| GET | `/api/posts` | List posts (`?page`, `limit`, `category`) |
| GET | `/api/posts/:slug` | Post by slug (increments views) |
| GET | `/api/posts/trending` | Trending (`?limit`, `days`) |
| GET | `/api/posts/categories` | Category counts |
| GET | `/api/meta/slugs` | Slugs + `lastmod` for sitemap |
| POST | `/api/posts/ingest` | Run RSS ingestion manually |

## Builds & production

```bash
npm run build:dev    # Next build with .env.development (local URLs)
npm run build:prod   # Next build with .env.production (live URLs) — same as npm run build
npm run start        # API + web from .env.production
npm run pm2:start    # PM2 API + web (production)
```

`NEXT_PUBLIC_*` values are **baked in at build time** — always run `build:prod` before deploying live.

- **Vercel (or any hosted frontend) cannot use `http://127.0.0.1:4000` as the API** — expose the API publicly and set `NEXT_PUBLIC_API_URL` on Vercel, plus `CORS_ORIGIN` on the API. See **[docs/VERCEL_PRODUCTION_API.md](./docs/VERCEL_PRODUCTION_API.md)**.
- Keep `OPENAI_API_KEY` server-side only (never `NEXT_PUBLIC_*`).

## License

Private / your choice.

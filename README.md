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

### 2. Environment

Copy `.env.example` to **`.env`** at the **repository root** (recommended so both apps can share it):

```bash
cp .env.example .env
```

Edit **`.env`**: set `MYSQL_*`, `RSS_FEED_URLS`, **`API_PORT`** / **`WEB_PORT`** (defaults 4000 / 3000), **`NEXT_PUBLIC_API_URL`** / **`NEXT_PUBLIC_SITE_URL`** (must match those ports), and optionally `OPENAI_API_KEY`.

Use **`http://127.0.0.1:<API_PORT>`** for `NEXT_PUBLIC_API_URL` on Windows if `localhost` resolves to IPv6 (`::1`).

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

## Production notes

- Run `npm run build` (builds the frontend workspace) and `npm run start:web` / `npm run start:api` with production `NODE_ENV` and real `NEXT_PUBLIC_SITE_URL`.
- Point `CORS_ORIGIN` at your deployed frontend URL(s).
- Keep `OPENAI_API_KEY` server-side only (never `NEXT_PUBLIC_*`).

## License

Private / your choice.

# PolicyDrift — News Ranking System

> **Version:** v2  
> **Last updated:** 2026-08-14

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [News Ingestion](#3-news-ingestion)
4. [Article Status Lifecycle](#4-article-status-lifecycle)
5. [The Four Feeds](#5-the-four-feeds)
6. [Ranking Formulas](#6-ranking-formulas)
7. [Background Workers](#7-background-workers)
8. [Admin System](#8-admin-system)
9. [View Deduplication](#9-view-deduplication)
10. [Environment Variables](#10-environment-variables)
11. [Migration Instructions](#11-migration-instructions)
12. [PM2 Deployment](#12-pm2-deployment)
13. [API Reference](#13-api-reference)

---

## 1. Overview

PolicyDrift's news system pulls articles from RSS feeds, stores them in MySQL, and surfaces them through four purpose-built ranked feeds. Each feed answers a different editorial question:

| Feed | Question answered |
|---|---|
| **Latest** | What was just published? |
| **Trending** | What is going viral *right now*? |
| **Top** | What is the most important story today? |
| **Popular** | What got the most attention this week / month? |

Ranking is computed off the hot request path by a background worker process. Every three minutes it recalculates `trending_score` and `top_score` for all articles published within the active ranking windows, using five component scores: freshness, velocity, engagement, source authority, and editorial priority.

---

## 2. Database Schema

### `posts` — extensions added in v2

The v2 migration adds the following columns to the existing `posts` table:

| Column | Type | Description |
|---|---|---|
| `url_hash` | `CHAR(64)` | SHA-256 of the canonical article URL; primary dedup key |
| `content_hash` | `CHAR(64)` | SHA-256 of the normalised title; catches re-posts with changed URLs |
| `source_id` | `INT` | FK → `news_sources.id`; `NULL` for hardcoded fallback feeds |
| `source_feed` | `VARCHAR(512)` | RSS feed URL the article was ingested from |
| `reading_time_minutes` | `TINYINT` | Estimated reading time (words ÷ 200) |
| `is_breaking` | `TINYINT(1)` | Breaking-news flag |
| `breaking_until` | `DATETIME` | Optional expiry for the breaking-news boost |
| `is_featured` | `TINYINT(1)` | Featured article flag |
| `featured_until` | `DATETIME` | Optional expiry for the featured boost |
| `editorial_priority` | `ENUM('normal','high','pinned')` | Manual editorial weight |
| `scheduled_at` | `DATETIME` | Publish this article at a future time |

### `news_sources`

Tracks all RSS feed sources. Can be managed through the admin API without a code deploy.

| Column | Type | Description |
|---|---|---|
| `id` | `INT AUTO_INCREMENT PK` | |
| `name` | `VARCHAR(255)` | Human-readable source name |
| `rss_url` | `VARCHAR(512)` | RSS / Atom feed URL |
| `category` | `VARCHAR(128)` | Default category for articles from this source |
| `trust_score` | `TINYINT` | Authority score 0–100 (default: 70) |
| `country` | `CHAR(2)` | ISO 3166-1 alpha-2 country code |
| `language` | `CHAR(8)` | BCP 47 language tag |
| `is_enabled` | `TINYINT(1)` | Set to 0 to pause ingestion without deleting |
| `last_fetched_at` | `DATETIME` | Timestamp of the most recent successful fetch |
| `last_error` | `TEXT` | Most recent fetch error message, if any |
| `articles_added` | `INT` | Running count of articles ingested from this source |

### `post_events`

An append-only event log. One row per user interaction. Aggregated into `post_metrics` by the metrics worker.

| Column | Type | Description |
|---|---|---|
| `id` | `BIGINT AUTO_INCREMENT PK` | |
| `post_id` | `INT` | FK → `posts.id` |
| `event_type` | `ENUM('view','like','share','comment','bookmark')` | |
| `ip_hash` | `CHAR(64)` | SHA-256 of the visitor's IP (privacy-safe dedup key) |
| `created_at` | `DATETIME` | Event timestamp |

Rows older than `RANKING.eventRetentionDays` (default: 30 days) are pruned by the daily cleanup cron.

### `post_metrics`

Pre-aggregated counters used by the ranking worker. Recomputed every 2 minutes.

| Column | Type | Description |
|---|---|---|
| `post_id` | `INT PK` | FK → `posts.id` |
| `views_5m` | `INT` | Views in the last 5 minutes |
| `views_30m` | `INT` | Views in the last 30 minutes |
| `views_1h` | `INT` | Views in the last hour |
| `views_6h` | `INT` | Views in the last 6 hours |
| `views_24h` | `INT` | Views in the last 24 hours |
| `likes_1h` / `likes_24h` | `INT` | Like counts |
| `shares_1h` / `shares_24h` | `INT` | Share counts |
| `comments_1h` | `INT` | Comment count (1 h window) |
| `bookmarks_24h` | `INT` | Bookmark count |
| `trending_score` | `FLOAT` | Composite trending score [0, 1] |
| `top_score` | `FLOAT` | Composite top score [0, 1] |
| `updated_at` | `DATETIME` | Last aggregation timestamp |

---

## 3. News Ingestion

### RSS Flow

```
news_sources table (or rss-feeds.js fallback)
        │
        ▼
  fetchAllFeedEntries()          ← rss.service.js (rss-parser)
        │  parallel per source
        ▼
  For each feed item:
    1. toCleanString(link)       → canonical URL
    2. sha256Hex(url)            → url_hash         ← dedup check 1
    3. normalizeTitle(title)     → sha256Hex(...)   ← dedup check 2
    4. feedBodyToArticleHtml()   → body HTML
    5. excerptFromFeedContent()  → 220-char excerpt
    6. allocateSlug()            → unique URL slug
    7. postModel.createPost()    → INSERT into posts
    8. sourceModel.recordFetchSuccess()
        │
        ▼
  submitNewUrlsToIndexNow()      ← IndexNow ping (HTTPS sites only)
```

### Source Management

Sources are loaded from `news_sources` at runtime. On first startup (empty table), the service auto-seeds sources from `src/config/rss-feeds.js` with a default `trust_score` of 70.

Sources can be added, edited, paused (`is_enabled = 0`), or deleted without restarting the server via the admin API.

### Duplicate Detection

Two independent checks prevent the same story from being ingested twice:

1. **URL hash** (`url_hash`): SHA-256 of the raw canonical URL. Catches exact re-fetches of the same article.
2. **Content hash** (`content_hash`): SHA-256 of the normalised title — lowercased, special characters stripped, whitespace collapsed, truncated to 200 chars. Catches re-posts where the publisher changed the URL but kept the same headline.

If either check matches an existing row, the item is counted as `skipped` and no database write occurs.

---

## 4. Article Status Lifecycle

```
[RSS ingest]
     │
     ▼
 published ──────────────────────────────────────────► (live on site)
     │
     │  admin: unpublish
     ▼
  draft ──────► (admin: schedule) ──► pending ──► published   (via scheduler cron)
     │
     │  admin: delete
     ▼
  deleted (soft)
```

| Status | Visible to public | Ranked |
|---|---|---|
| `published` | Yes | Yes |
| `draft` | No | No |
| `pending` | No | No |
| `deleted` | No | No |

Scheduled articles are stored with `status = 'pending'` and `scheduled_at` set to the desired publish time. The scheduler cron (every 1 minute) flips them to `published` when `scheduled_at <= NOW()`.

---

## 5. The Four Feeds

### Latest

**What it is:** A chronological reverse-date feed. No score required.

**SQL ordering:** `ORDER BY published_at DESC`

**Use case:** Breaking news widgets, "Just In" sidebars, RSS mirrors.

---

### Trending

**What it is:** Articles gaining momentum *right now*. Velocity-first.

**Composite formula:**
```
trending_score = velocity×0.40 + freshness_trending×0.30
              + engagement×0.15 + source×0.10 + editorial×0.05
```

**Freshness half-life:** 6 hours. An article published 18 hours ago has a trending freshness score of ~0.05 — it effectively drops off trending regardless of its other scores.

**Ranking window:** Articles published within the last **2 days** are eligible.

**Use case:** Top-of-page hero slots, "What's Trending" widgets.

---

### Top

**What it is:** The most significant stories of the day. Quality-first — balances total engagement with a slower freshness decay.

**Composite formula:**
```
top_score = engagement×0.30 + freshness_top×0.25
          + source×0.20 + velocity×0.15 + editorial×0.10
```

**Freshness half-life:** 24 hours. A 3-day-old article with massive engagement can still outrank a brand-new article with zero traction.

**Ranking window:** Articles published within the last **7 days** are eligible.

**Use case:** Homepage featured articles, daily digest emails.

---

### Popular

**What it is:** The most-viewed articles over a selected time period (week or month). Uses raw engagement counters, not a composite score.

**Ordering:** `views_24h DESC` (weekly), `views_24h DESC` over a 30-day window (monthly). Exact windowing is controlled by the query, not a pre-computed score.

**Use case:** "Most Read" sidebars, archive pages.

---

## 6. Ranking Formulas

All five component scores are bounded **[0, 1]**. The ranking worker runs every 3 minutes and writes results to `post_metrics`.

### 6.1 Freshness Score

Exponential decay. An article's freshness score falls continuously from 1.0 at publication toward 0 as time passes.

```
freshness(publishedAt, halfLifeHours) = exp( -ageHours / halfLifeHours )
```

| Age vs. half-life | Score |
|---|---|
| 0 (just published) | 1.000 |
| 1× half-life | ≈ 0.368 |
| 2× half-life | ≈ 0.135 |
| 3× half-life | ≈ 0.050 |

Two half-life values are used:

| Feed | Half-life | 18 h score | 3 d score |
|---|---|---|---|
| Trending | 6 h | ≈ 0.050 | ≈ 0.000 |
| Top | 24 h | ≈ 0.472 | ≈ 0.050 |

### 6.2 Velocity Score

Measures how fast an article is gaining attention. Heavily weights the most recent view windows and high-value interactions (shares, comments).

```
weighted = views_5m×4 + views_30m×2 + views_1h×1.5 + views_6h×1
         + likes_1h×2 + shares_1h×5 + comments_1h×4

velocity = tanh( weighted / (ageHours + 1) / 50 )
```

The `tanh` function bounds the result to [0, 1] and provides natural saturation — a small-traffic spike on a niche site is treated proportionally to a large-traffic spike on a mainstream site.

The `(ageHours + 1)` denominator penalises older articles: the same raw event count generates a lower velocity score as the article ages.

**Interaction weights:**

| Signal | Weight | Rationale |
|---|---|---|
| 5-minute views | 4 | Strongest recency signal |
| 30-minute views | 2 | |
| 1-hour views | 1.5 | |
| 6-hour views | 1 | |
| Shares | 5 | Highest-intent action |
| Comments | 4 | Strong engagement |
| Likes | 2 | Passive positive signal |

### 6.3 Engagement Score

Measures total recent interactions. Unlike velocity, this does not penalise age — it reflects cumulative 24-hour interest.

```
raw = views_24h + likes_24h×2 + shares_24h×5
    + comments_1h×4 + bookmarks_24h×3

engagement = min( 1, log(1 + raw) / 10 )
```

The logarithm compresses the scale so that very large traffic numbers don't overwhelm smaller-but-still-noteworthy articles. At the default `logScale` of 10, the score reaches 1.0 at approximately 22,000 weighted events.

### 6.4 Source Score

A direct normalisation of the source's editorial authority rating.

```
source = trust_score / 100
```

`trust_score` is an integer 0–100 stored in `news_sources.trust_score`. Newly seeded sources default to 70 (score 0.70). Premium sources such as major newspapers can be raised to 90–100 by an admin.

### 6.5 Editorial Score

A manual priority override applied by admins. Pinned and breaking articles receive the highest boosts.

| Condition | Score |
|---|---|
| `editorial_priority = 'pinned'` | 1.0 |
| `is_breaking = true` AND within `breaking_until` window | 0.9 |
| `editorial_priority = 'high'` | 0.8 |
| `is_featured = true` AND within `featured_until` window | 0.7 |
| `editorial_priority = 'normal'` (default) | 0.5 |

**Expiry:** If `breaking_until` or `featured_until` is set and has passed, the flag is treated as if it were never set. The scheduler cron also clears stale flags in the database every 5 minutes.

### 6.6 Composite Scores

```
trending_score = velocity×0.40 + freshness_trending×0.30
              + engagement×0.15 + source×0.10 + editorial×0.05

top_score      = engagement×0.30 + freshness_top×0.25
              + source×0.20 + velocity×0.15 + editorial×0.10
```

Each weight set sums to 1.0. Both scores are stored in `post_metrics` and read directly by the feed queries — ranking never runs on the HTTP request path.

---

## 7. Background Workers

The worker process (`src/workers/worker.js`) is run as a dedicated PM2 app (`policydrift-worker`). It registers six cron jobs on startup.

| # | Job | Schedule | What it does |
|---|---|---|---|
| 1 | **Metrics aggregation** | Every 2 min | Counts events from `post_events` into `post_metrics` time-window columns |
| 2 | **Ranking calculation** | Every 3 min | Recomputes `trending_score` and `top_score` for all articles in the active window |
| 3 | **Scheduled publishing** | Every 1 min | Flips `pending` articles to `published` when `scheduled_at <= NOW()` |
| 4 | **Breaking/featured expiry** | Every 5 min | Clears stale `is_breaking` and `is_featured` flags where `*_until <= NOW()` |
| 5 | **RSS ingest** | Every N min* | Fetches all enabled sources, deduplicates, and creates new posts |
| 6 | **Event cleanup** | Daily at 03:00 | Deletes `post_events` rows older than `eventRetentionDays` (30 days) |

*\* N = `RSS_CRON_INTERVAL_MINUTES` (default: 5, range: 1–59).*

When `WORKER_ENABLED=true` is set in the API process environment, the API skips its own RSS cron to avoid double-ingestion. The worker process always sets this flag in `ecosystem.config.cjs`.

---

## 8. Admin System

All admin endpoints require the `x-admin-secret` HTTP header to match the `ADMIN_SECRET` environment variable. There is no session or JWT — keep the secret out of client-side code.

### Authentication

```
x-admin-secret: <value of ADMIN_SECRET>
```

A missing or incorrect secret returns `401 Unauthorized`.

### Article Editorial Actions

| Endpoint | Effect |
|---|---|
| `POST /api/admin/articles/:id/publish` | Set `status = published` |
| `POST /api/admin/articles/:id/unpublish` | Set `status = draft` |
| `POST /api/admin/articles/:id/schedule` | Set `status = pending`, `scheduled_at = body.scheduledAt` |
| `POST /api/admin/articles/:id/feature` | Set `is_featured = 1`, optionally `featured_until` |
| `POST /api/admin/articles/:id/unfeature` | Clear `is_featured` |
| `POST /api/admin/articles/:id/breaking` | Set `is_breaking = 1`, optionally `breaking_until` |
| `POST /api/admin/articles/:id/unbreaking` | Clear `is_breaking` |
| `POST /api/admin/articles/:id/priority` | Set `editorial_priority` (normal / high / pinned) |

### Source Management

Sources control which RSS feeds are ingested. Changes take effect on the next ingest cron tick — no restart needed.

| Endpoint | Effect |
|---|---|
| `GET /api/admin/sources` | List all sources |
| `POST /api/admin/sources` | Add a new source |
| `PUT /api/admin/sources/:id` | Update source fields |
| `DELETE /api/admin/sources/:id` | Remove a source |
| `POST /api/admin/sources/:id/test` | Validate the RSS URL returns parseable feed |
| `POST /api/admin/sources/:id/fetch` | Trigger an immediate ingest for one source |

### Manual Worker Triggers

Useful for forcing a cycle without waiting for the cron interval.

| Endpoint | Triggers |
|---|---|
| `POST /api/admin/ingest` | `ingestFromRss()` |
| `POST /api/admin/ranking` | `runRankingPass()` |
| `POST /api/admin/metrics` | `runMetricsAggregation()` |
| `POST /api/admin/scheduler` | `publishScheduledArticles()` + expiry jobs |

---

## 9. View Deduplication

To prevent a single user from inflating an article's view count, view events are deduplicated per article per IP address within a configurable rolling window.

**Mechanism:**

1. When `GET /api/news/:slug` is called, the server hashes the visitor's IP address with SHA-256.
2. It queries `post_events` for an existing `view` event for the same `(post_id, ip_hash)` pair within the last `viewDedupMinutes` minutes.
3. If no matching event exists, a new `view` event is written and the view counter is incremented.
4. If a matching event exists, the request is served but no event is recorded.

The IP address itself is never stored — only its hash. This satisfies privacy requirements while preventing count inflation.

**Default window:** 30 minutes (overridable via `VIEW_DEDUP_WINDOW_MINUTES`).

---

## 10. Environment Variables

The following variables were added in v2. All existing v1 variables remain unchanged.

| Variable | Default | Description |
|---|---|---|
| `ADMIN_SECRET` | *(required)* | Shared secret for all `/api/admin/*` endpoints (`x-admin-secret` header) |
| `WORKER_ENABLED` | `false` | Set to `true` in the API process when a dedicated worker PM2 process is running, to prevent double-ingestion |
| `VIEW_DEDUP_WINDOW_MINUTES` | `30` | Rolling window for per-IP view deduplication |
| `RANKING_TRENDING_DAYS` | `2` | How many days back to include articles in trending ranking |
| `RANKING_TOP_DAYS` | `7` | How many days back to include articles in top ranking |
| `INDEXNOW_KEY` | `''` | IndexNow API key for notifying search engines of new URLs (HTTPS sites only) |
| `STORY_FALLBACK_IMAGE_URL` | `''` | Default image URL used when an article has no image |
| `TRENDS_ENABLED` | `false` | Enable Google Trends topic matching |
| `TRENDS_GEO` | `IN` | Google Trends geography code |
| `TRENDS_REQUEST_DELAY_MS` | `3500` | Delay between Trends API requests to avoid rate limiting |
| `TRENDS_CACHE_MAX_AGE_HOURS` | `48` | How long to cache Trends results before refreshing |
| `TRENDS_MATCH_POST_HOURS` | `72` | Only match Trends topics against articles published within this window |
| `TRENDS_MATCH_POST_LIMIT` | `200` | Maximum number of posts to evaluate per Trends cycle |
| `TRENDS_REFRESH_SECRET` | `''` | Secret for the manual Trends refresh endpoint |
| `TRENDS_CRON` | `*/10 * * * *` | Cron expression for the Trends refresh job |

### Complete `.env.production` example

```dotenv
# Database
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=policydrift
MYSQL_PASSWORD=strongpassword
MYSQL_DATABASE=policydrift

# App
NODE_ENV=production
API_PORT=4050
WEB_PORT=3050
CORS_ORIGIN=https://policydrift.in
SITE_PUBLIC_URL=https://policydrift.in

# Worker
WORKER_ENABLED=true
RSS_CRON_INTERVAL_MINUTES=5
RSS_MAX_ITEMS=50

# Admin
ADMIN_SECRET=replace-with-a-long-random-string

# Ranking
VIEW_DEDUP_WINDOW_MINUTES=30
RANKING_TRENDING_DAYS=2
RANKING_TOP_DAYS=7

# Optional features
INDEXNOW_KEY=your-indexnow-key
STORY_FALLBACK_IMAGE_URL=https://policydrift.in/images/og-default.jpg
TRENDS_ENABLED=true
TRENDS_GEO=IN
```

---

## 11. Migration Instructions

### Prerequisites

- MySQL 8.0+ or MariaDB 10.6+
- Run as a user with `ALTER TABLE`, `CREATE TABLE`, and `CREATE INDEX` permissions on the `policydrift` database

### Step 1 — Run the v2 migration

```bash
mysql -u root -p policydrift < scripts/migration-v2.sql
```

The migration script:

1. Adds v2 columns to the `posts` table (safe — uses `IF NOT EXISTS` checks)
2. Creates the `news_sources` table
3. Creates the `post_events` table
4. Creates the `post_metrics` table
5. Adds indexes for all ranking and dedup queries

### Step 2 — Seed sources

Sources are auto-seeded on first startup from `src/config/rss-feeds.js` if the `news_sources` table is empty. You can also insert them manually or via the admin API.

### Step 3 — Set environment variables

Copy `.env.production.example` to `.env.production` and fill in all required values, particularly `ADMIN_SECRET` and `WORKER_ENABLED=true`.

### Step 4 — Deploy

Follow the [PM2 Deployment](#12-pm2-deployment) steps below.

### Rollback

The v2 migration is additive (new columns and tables only). To rollback:

```sql
-- Remove new columns from posts
ALTER TABLE posts
  DROP COLUMN url_hash,
  DROP COLUMN content_hash,
  DROP COLUMN source_id,
  DROP COLUMN source_feed,
  DROP COLUMN reading_time_minutes,
  DROP COLUMN is_breaking,
  DROP COLUMN breaking_until,
  DROP COLUMN is_featured,
  DROP COLUMN featured_until,
  DROP COLUMN editorial_priority,
  DROP COLUMN scheduled_at;

-- Drop new tables
DROP TABLE IF EXISTS post_metrics;
DROP TABLE IF EXISTS post_events;
DROP TABLE IF EXISTS news_sources;
```

---

## 12. PM2 Deployment

PolicyDrift uses three PM2 processes managed by `ecosystem.config.cjs`.

### Initial deployment

```bash
# 1. Install dependencies
npm ci

# 2. Build the Next.js frontend
npm run build:prod

# 3. Start all three PM2 apps
npm run pm2:start
# Equivalent to: pm2 start ecosystem.config.cjs --env production

# 4. Persist the process list across server reboots
pm2 save
pm2 startup   # follow the printed instructions
```

### PM2 process overview

| PM2 name | Script | Instances | Purpose |
|---|---|---|---|
| `policydrift-worker` | `backend/src/workers/worker.js` | 1 (fork) | All background cron jobs |
| `policydrift-api` | `backend/src/server.js` | 1 (fork) | Express REST API |
| `policydrift-web` | Next.js `next start` | 1 (fork) | Next.js frontend |

> **Important:** `policydrift-worker` must run as exactly **one instance** (`exec_mode: fork`). Running multiple worker instances would cause duplicate cron executions and double-ingestion.

### Common operations

```bash
# Reload all processes with zero downtime (API + web only; worker restarts)
pm2 reload policydrift-api policydrift-web

# Restart everything (briefly interrupts traffic)
pm2 restart policydrift-api policydrift-web policydrift-worker --update-env

# Stop everything
pm2 stop policydrift-api policydrift-web policydrift-worker

# View live logs
pm2 logs policydrift-api
pm2 logs policydrift-worker

# Monitor resource usage
pm2 monit
```

### After a code update

```bash
git pull
npm ci
npm run build:prod
pm2 reload policydrift-api policydrift-web
pm2 restart policydrift-worker --update-env
```

---

## 13. API Reference

### Public News Endpoints

Base path: `/api/news`

#### `GET /api/news/latest`

Returns the most recently published articles in reverse chronological order.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `category` | string | — | Filter by category slug |

**Response:**
```json
{
  "articles": [ { "slug": "...", "title": "...", "publishedAt": "...", ... } ],
  "total": 1234,
  "page": 1,
  "limit": 20
}
```

---

#### `GET /api/news/trending`

Returns articles ranked by `trending_score` DESC. Covers the last 2 days by default.

**Query parameters:** `page`, `limit`, `category` (same as above)

---

#### `GET /api/news/top`

Returns articles ranked by `top_score` DESC. Covers the last 7 days by default.

**Query parameters:** `page`, `limit`, `category` (same as above)

---

#### `GET /api/news/popular`

Returns the most-viewed articles over a selected time period.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `period` | `week` \| `month` | `week` | Time window |
| `page` | integer | `1` | |
| `limit` | integer | `20` | |
| `category` | string | — | |

---

#### `GET /api/news/:slug`

Returns a single article by its URL slug. Also records a view event (subject to deduplication).

**Response:** Full article object including `body`, `key_takeaways`, `reading_time_minutes`, and metrics snapshot.

---

#### `POST /api/news/:id/events`

Records an engagement event (like, share, comment, bookmark) for an article.

**Request body:**
```json
{ "type": "like" }
```

`type` must be one of: `like`, `share`, `comment`, `bookmark`.

---

### Admin Endpoints

Base path: `/api/admin`  
**All requests require:** `x-admin-secret: <ADMIN_SECRET>`

#### Articles

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/articles` | List all articles (supports `status`, `page`, `limit` filters) |
| `GET` | `/api/admin/articles/:id` | Get a single article by ID |
| `PUT` | `/api/admin/articles/:id` | Update article fields (title, body, category, image_url, etc.) |
| `DELETE` | `/api/admin/articles/:id` | Soft-delete an article |
| `POST` | `/api/admin/articles/:id/publish` | Publish a draft or pending article |
| `POST` | `/api/admin/articles/:id/unpublish` | Revert to draft |
| `POST` | `/api/admin/articles/:id/schedule` | Schedule future publish (`body.scheduledAt` ISO datetime) |
| `POST` | `/api/admin/articles/:id/feature` | Feature an article (optional `body.featuredUntil`) |
| `POST` | `/api/admin/articles/:id/unfeature` | Remove featured flag |
| `POST` | `/api/admin/articles/:id/breaking` | Mark as breaking news (optional `body.breakingUntil`) |
| `POST` | `/api/admin/articles/:id/unbreaking` | Remove breaking-news flag |
| `POST` | `/api/admin/articles/:id/priority` | Set editorial priority (`body.priority`: `normal`\|`high`\|`pinned`) |

#### Sources

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/sources` | List all RSS sources |
| `POST` | `/api/admin/sources` | Create a new source |
| `PUT` | `/api/admin/sources/:id` | Update a source (name, rss_url, trust_score, is_enabled, …) |
| `DELETE` | `/api/admin/sources/:id` | Delete a source |
| `POST` | `/api/admin/sources/:id/test` | Validate the source's RSS feed URL |
| `POST` | `/api/admin/sources/:id/fetch` | Trigger an immediate ingest for this source only |

#### Worker Triggers

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/ingest` | Run a full RSS ingest cycle |
| `POST` | `/api/admin/ranking` | Recompute trending and top scores |
| `POST` | `/api/admin/metrics` | Re-aggregate post_events into post_metrics |
| `POST` | `/api/admin/scheduler` | Run scheduled publishing + expiry jobs |

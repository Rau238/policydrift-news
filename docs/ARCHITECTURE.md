# NewsFree365 — System Architecture & Technical Specifications

This document defines the high-level architecture, module boundaries, data flows, caching hierarchies, and security models of the NewsFree365 news platform.

---

## 1. Architectural Principles

1. **Sub-Second TTFB & Edge Performance**: Next.js 14 App Router utilizes React Server Components (RSC) and Streaming SSR to render pages with near-instant initial paint.
2. **Off-Path Asynchronous Heavy Compute**: Ingestion, ranking calculation, RSS parsing, LLM rewriting, and sports scraping are strictly isolated into dedicated background workers and daemons.
3. **Zero-Downtime Hot Deployments**: Production compiles in background isolation without taking down active Node/Express PM2 cluster processes.
4. **Resilient Primary Source Grounding**: Every story retains primary canonical URL links, publisher attributions, and source verification metadata.

---

## 2. Process & Component Model

The application operates across 4 independent PM2 processes defined in `ecosystem.config.cjs`:

```mermaid
graph TD
    subgraph PM2_Process_Manager["PM2 Process Supervisor"]
        API["newsfree365-api (Express.js)<br/>Port 4050 | REST & SSR Internal API"]
        WEB["newsfree365-web (Next.js 14)<br/>Port 3050 | Web Application & Edge SSR"]
        WORKER["newsfree365-worker (Node.js)<br/>Standalone Cron & RSS Ingestion"]
        SPORTS["newsfree365-sports (Python 3.11)<br/>Unified Cricbuzz + Tribuna Scraper Hub"]
    end

    subgraph Data_Stores["Data Layer"]
        MySQL[("MySQL 8 Storage<br/>Tables: posts, news_sources, views, subscribers")]
        MemCache["In-Memory Cache (45s Quotes, 60s Telemetry)"]
    end

    API <--> MySQL
    WORKER --> MySQL
    SPORTS --> API
    WEB <--> API
    API <--> MemCache
```

---

## 3. Data Pipelines & Lifecycle

### Ingestion Flow:
```mermaid
sequenceDiagram
    participant RSS as External RSS Feeds
    participant Worker as newsfree365-worker
    participant DB as MySQL Database
    participant API as Express API
    participant User as Web Reader

    Worker->>RSS: Poll feed XML every 60s
    RSS-->>Worker: Feed items
    Worker->>Worker: SHA-256 URL & Content Deduplication
    Worker->>DB: INSERT IGNORE into `posts`
    Worker->>DB: Compute 5-Factor Ranking Scores (every 3m)
    User->>API: GET /api/news?feed=trending
    API->>DB: Query indexed posts by `trending_score DESC`
    DB-->>API: Return top stories
    API-->>User: Rendered Feed
```

---

## 4. 5-Factor News Ranking System

Stories are dynamically ranked according to the formula:
$$\text{Score} = (\text{Freshness} \times w_1) + (\text{Velocity} \times w_2) + (\text{Engagement} \times w_3) + (\text{Authority} \times w_4) + (\text{Editorial} \times w_5)$$

- **Freshness**: Half-life exponential decay based on article publish timestamp.
- **Velocity**: Rate of change of views in the last 1–6 hours.
- **Engagement**: Weighted sum of likes ($3\times$), shares ($5\times$), and bookmarks ($4\times$).
- **Source Authority**: Dynamic tier multiplier (Tier 1 global wire vs niche beat).
- **Editorial Boost**: Pinned or breaking news boosts with automated TTL expiration.

---

## 5. Security & Isolation Model

- **Environment Isolation**:
  - Development builds use isolated cache `frontend/.next-dev/`.
  - Production builds live exclusively in `frontend/.next/`.
- **Admin Endpoints**: Protected via `x-admin-secret` authentication and IP-based rate limiting.
- **Content Sanitization**: Markdown and raw RSS HTML are strictly sanitized via DOMPurify to prevent XSS.
- **Database Safety**: Prepared SQL statements (`mysql2/promise` with parameterized queries) prevent SQL injection across all models.

# NewsFree365 — Complete REST API Reference

This document provides the complete API specification for all public, admin, sports, calendar, and distribution endpoints exposed by the backend Express service (`http://127.0.0.1:4050`).

---

## Base URLs & Authentication

- **Development API**: `http://localhost:4050`
- **Production API**: `https://www.newsfree365.live` (or local SSR internal proxy `http://127.0.0.1:4050`)
- **Admin Authentication**: All `/api/admin/*` endpoints require the `x-admin-secret` HTTP request header matching the server's `ADMIN_SECRET` environment variable.

---

## Table of Contents

1. [Core & Health](#1-core--health)
2. [Public News & Content](#2-public-news--content)
3. [Sports Intelligence (Cricket & Football)](#3-sports-intelligence-cricket--football)
4. [Economic & Market Calendars](#4-economic--market-calendars)
5. [Live Market Quotes](#5-live-market-quotes)
6. [Interactive Features (Polls & Quizzes)](#6-interactive-features-polls--quizzes)
7. [Distribution (Web Push & Newsletters)](#7-distribution-web-push--newsletters)
8. [Admin Endpoints](#8-admin-endpoints)

---

## 1. Core & Health

### `GET /health`
Verifies backend service liveness.

- **Request**: None
- **Response**: `200 OK`
```json
{
  "ok": true,
  "service": "newsfree365-api"
}
```

---

## 2. Public News & Content

### `GET /api/news`
Fetches ranked stories across specific algorithms with cursor or offset pagination.

- **Query Parameters**:
  - `feed` (optional): `latest` | `trending` | `top` | `popular` (default: `latest`)
  - `category` (optional): DB category name (e.g. `Politics`, `Technology`, `Sports`, `India`)
  - `page` (optional): integer (default: `1`)
  - `limit` (optional): integer (default: `20`, max: `50`)
  - `country` (optional): ISO code (e.g. `IN`, `US`, `GLOBAL`)

- **Response**: `200 OK`
```json
{
  "posts": [
    {
      "id": 195708,
      "title": "Global Tech Summit Outlines Next-Gen AI Standards",
      "slug": "global-tech-summit-outlines-next-gen-ai-standards",
      "category": "Technology",
      "image_url": "https://example.com/image.jpg",
      "excerpt": "Key takeaways from the opening address...",
      "published_at": "2026-09-17T11:45:00.000Z",
      "views": 412,
      "reading_time_minutes": 3,
      "is_breaking": 0,
      "trending_score": 84.5
    }
  ],
  "total": 195708,
  "page": 1,
  "totalPages": 9786
}
```

---

### `GET /api/news/:slug`
Fetches full article metadata and body content by slug. Increments non-duplicate view counters.

- **Path Parameters**: `slug` (string)
- **Response**: `200 OK`
```json
{
  "post": {
    "id": 195708,
    "title": "Global Tech Summit Outlines Next-Gen AI Standards",
    "slug": "global-tech-summit-outlines-next-gen-ai-standards",
    "category": "Technology",
    "content": "<p>Full sanitized article body in HTML or Markdown...</p>",
    "excerpt": "Key takeaways from the opening address...",
    "image_url": "https://example.com/image.jpg",
    "source_url": "https://primary-source.com/article/123",
    "source_name": "Reuters Tech",
    "published_at": "2026-09-17T11:45:00.000Z",
    "views": 413,
    "likes": 28,
    "shares": 14,
    "reading_time_minutes": 3,
    "key_takeaways": "[\"First key point\", \"Second key point\"]"
  }
}
```

---

### `POST /api/news/:id/events`
Records user engagement telemetry (`like`, `share`, `bookmark`, `read_complete`).

- **Path Parameters**: `id` (integer post ID)
- **Request Body**:
```json
{
  "eventType": "like"
}
```
- **Response**: `200 OK`
```json
{
  "ok": true,
  "postId": 195708,
  "eventType": "like"
}
```

---

## 3. Sports Intelligence (Cricket & Football)

### `GET /api/cricket/matches`
Returns all active, upcoming, and completed cricket matches from the Sports Hub telemetry cache.

- **Response**: `200 OK`
```json
{
  "live": [
    {
      "matchId": "cric_98452",
      "series": "ICC Men's World Cup",
      "matchDesc": "India vs Australia, 3rd ODI",
      "status": "India need 24 runs in 18 balls",
      "team1": { "name": "India", "shortName": "IND", "score": "282/6", "overs": "47.0" },
      "team2": { "name": "Australia", "shortName": "AUS", "score": "305/8", "overs": "50.0" },
      "isLive": true
    }
  ],
  "upcoming": [],
  "completed": [],
  "fetchedAt": "2026-09-17T12:00:00.000Z"
}
```

---

### `GET /api/football/matches`
Returns live and scheduled football matches from the Tribuna telemetry cache.

- **Response**: `200 OK`
```json
{
  "live": [
    {
      "matchId": "foot_11029",
      "league": "Premier League",
      "homeTeam": { "name": "Arsenal", "score": "2" },
      "awayTeam": { "name": "Chelsea", "score": "1" },
      "minute": "78'",
      "status": "2nd Half"
    }
  ],
  "scheduled": [],
  "completed": [],
  "fetchedAt": "2026-09-17T12:00:00.000Z"
}
```

---

## 4. Economic & Market Calendars

### `GET /api/calendar/macro`
Fetches global central bank and macroeconomic events (RBI, US Fed, CPI, GDP, IIP).

- **Query Parameters**:
  - `country` (optional): `IN` | `US` | `GLOBAL` (default: `GLOBAL`)
  - `month` (optional): `YYYY-MM`

- **Response**: `200 OK`
```json
{
  "events": [
    {
      "id": "macro_rbi_oct_2026",
      "title": "RBI Monetary Policy Committee (MPC) Rate Decision",
      "country": "IN",
      "eventDate": "2026-10-09",
      "impact": "HIGH",
      "actual": "6.50%",
      "forecast": "6.50%",
      "previous": "6.50%"
    }
  ]
}
```

---

## 5. Live Market Quotes

### `GET /api/market-quotes`
Returns cached stock index, commodity, currency, and crypto quotes with 45s TTL.

- **Response**: `200 OK`
```json
{
  "quotes": [
    {
      "ok": true,
      "id": "nifty_50",
      "symbol": "^NSEI",
      "label": "NIFTY 50",
      "price": 25350.20,
      "change": 142.80,
      "changePercent": 0.57,
      "country": "IN"
    }
  ],
  "fetchedAt": "2026-09-17T12:00:00.000Z"
}
```

---

## 6. Interactive Features (Polls & Quizzes)

### `GET /api/polls/today`
Returns the active Newsroom Poll of the Day and voting statistics.

- **Response**: `200 OK`
```json
{
  "poll": {
    "id": 42,
    "question": "Will central banks begin rate cuts in Q4?",
    "options": [
      { "id": 1, "text": "Yes, aggressive easing", "votes": 340 },
      { "id": 2, "text": "No, inflation remains sticky", "votes": 210 }
    ],
    "totalVotes": 550
  }
}
```

### `POST /api/polls/:id/vote`
Records a vote for a poll option.

- **Request Body**:
```json
{
  "optionId": 1
}
```
- **Response**: `200 OK`

---

## 7. Distribution (Web Push & Newsletters)

### `POST /api/push/subscribe`
Subscribes a client browser for native Web Push notifications via VAPID.

- **Request Body**:
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BNc...",
      "auth": "A8j..."
    }
  }
}
```
- **Response**: `200 OK`
```json
{
  "ok": true,
  "message": "Subscription registered successfully"
}
```

### `POST /api/newsletter/subscribe`
Subscribes an email address to the 10:00 AM Daily Briefing.

- **Request Body**:
```json
{
  "email": "reader@example.com"
}
```
- **Response**: `200 OK`

---

## 8. Admin Endpoints

All admin endpoints are strictly protected and require authentication via any of the following:
1. **Header**: `x-admin-secret: <ADMIN_SECRET>`
2. **Bearer Token**: `Authorization: Bearer <ADMIN_SECRET>`
3. **Cookie**: `pd_admin=<ADMIN_SECRET>`
4. **Query Parameter**: `?secret=<ADMIN_SECRET>` (or `?admin_secret=<ADMIN_SECRET>`)

---

### `GET /api/admin/health` (or `/api/admin/health-check`)
**Admin-Protected Deep Health Check & Diagnostics Endpoint.**

Performs real-time latency tests on the MySQL connection pool, audits database storage & row counts, inspects active RSS ingestion workers, calculates Node.js process memory metrics (RSS, heap, external), and validates third-party integrations (VAPID, SMTP, Google Trends).

#### Authentication Options:
```bash
# Option 1: Header Authentication (Recommended for scripts/cURL)
curl -X GET http://localhost:4050/api/admin/health \
  -H "x-admin-secret: your_admin_password"

# Option 2: Bearer Token
curl -X GET http://localhost:4050/api/admin/health \
  -H "Authorization: Bearer your_admin_password"

# Option 3: Query Parameter (Recommended for monitoring services like Uptime Kuma)
curl -X GET "http://localhost:4050/api/admin/health?secret=your_admin_password"
```

#### Responses:

##### `200 OK` (Healthy Response Example)
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2026-09-17T12:23:37.277Z",
  "responseTimeMs": 91,
  "system": {
    "uptimeSeconds": 3600,
    "uptimeFormatted": "1h 0m 0s",
    "environment": "production",
    "nodeVersion": "v22.12.0",
    "platform": "win32",
    "arch": "x64",
    "pid": 23620,
    "memory": {
      "rssMb": 137.16,
      "heapUsedMb": 44.59,
      "heapTotalMb": 94.77,
      "externalMb": 4.2
    }
  },
  "database": {
    "status": "connected",
    "pingLatencyMs": 6,
    "host": "127.0.0.1",
    "port": 3306,
    "database": "policydrift_news",
    "poolLimit": 10,
    "totalPosts": 197387,
    "published24h": 13369,
    "activeSourcesCount": 188,
    "storage": {
      "usedMb": 1019.61,
      "dataFreeMb": 8.0,
      "tableCount": 16
    }
  },
  "services": {
    "rssWorker": {
      "workerEnabled": true,
      "cronEnabled": true,
      "configuredFeedsCount": 185,
      "lastIngestedPost": {
        "id": 316240,
        "title": "Inside Tata empire as Chandra gets five-year term",
        "slug": "inside-tata-empire-as-chandra-gets-five-year-term",
        "publishedAt": "2026-09-17T11:51:52.000Z",
        "createdAt": "2026-09-17T12:23:35.000Z"
      }
    },
    "trends": {
      "enabled": true,
      "geo": "IN",
      "cron": "*/30 * * * *"
    },
    "pushNotifications": {
      "vapidConfigured": true,
      "activeSubscribers": 1420
    },
    "newsletter": {
      "smtpConfigured": true,
      "activeSubscribers": 520
    }
  }
}
```

##### `401 Unauthorized` (Missing or Invalid Admin Secret)
```json
{
  "error": "Unauthorized",
  "hint": "Provide valid admin credentials via x-admin-secret header, Bearer token, cookie, or ?secret= query parameter."
}
```

##### `503 Service Unavailable` (Database Failure or Backend Outage)
```json
{
  "ok": false,
  "status": "unhealthy",
  "timestamp": "2026-09-17T12:23:37.277Z",
  "responseTimeMs": 105,
  "database": {
    "status": "error",
    "pingLatencyMs": null
  }
}
```

---

### `GET /api/admin/stats`
Returns aggregate editorial statistics (total posts, total views, pending reviews, scheduled items).

### `GET /api/admin/activity`
Returns the 15 most recent articles created or updated.

### `POST /api/admin/articles`
Creates and publishes an article manually.

### `POST /api/admin/push/broadcast`
Sends an immediate Web Push notification to all active subscribers.

### `POST /api/admin/newsletter/broadcast`
Sends a manual newsletter digest to all active email subscribers.

### `POST /api/admin/ingest`
Triggers an immediate on-demand RSS ingestion pass across all active sources.

### `POST /api/admin/ranking`
Triggers an immediate recalculation of 5-factor trending and top scores.


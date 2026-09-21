# NewsFree365 — Production Deployment & Operations Guide

This guide describes the **Zero-Downtime Production Deployment Protocol**, PM2 process management, and operational runbooks for NewsFree365.

---

## 🛑 Critical Build Safety Protocol

In according with repository rules defined in `AGENTS.md`:
1. **Never automatically trigger production builds** without explicit user confirmation.
2. **Environment Isolation**:
   - Development builds use `frontend/.next-dev/`.
   - Production builds live exclusively in `frontend/.next/`.
   - Never wipe or delete `frontend/.next/` while live services are serving traffic.

---

## 🚀 Zero-Downtime Deployment Workflow

When deploying code updates to production without service blackout:

```bash
# Step 1: Compile the optimized production bundle in background
npx cross-env CONFIRM_BUILD=yes npm run build:prod

# Step 2: Gracefully restart PM2 processes with updated environment
npx pm2 restart newsfree365-web newsfree365-api --update-env

# Step 3: Health Verification
curl http://localhost:3050/
curl http://127.0.0.1:4050/health
```

---

## ⚙️ PM2 Process Management

The production cluster is configured via `ecosystem.config.cjs` and manages 4 dedicated processes:

| Process Name | Runtime | Role | Restart Memory |
|---|---|---|---|
| `newsfree365-web` | Node.js | Next.js 14 Frontend Web (Port 3050) | 500M |
| `newsfree365-api` | Node.js | Express REST API Backend (Port 4050) | 500M |
| `newsfree365-worker` | Node.js | Dedicated RSS Ingestion & Ranking Cron | 300M |
| `newsfree365-sports` | Python 3.11 | Cricbuzz & Tribuna Scraper Hub Daemon | 600M |

### Useful PM2 Commands:

```bash
# Start all processes
npm run pm2:start

# Inspect cluster status
npm run pm2:status

# View live stream logs
npm run pm2:logs

# Restart cluster with zero downtime
npm run pm2:restart

# Stop all processes
npm run pm2:stop
```

---

## 🔍 Health Checks & Monitoring

### 1. Web Frontend Health
```bash
curl -I http://localhost:3050
# Expected: HTTP/1.1 200 OK
```

### 2. API Backend Health
```bash
curl http://127.0.0.1:4050/health
# Expected: {"ok":true,"service":"newsfree365-api"}
```

### 3. Database Check
```bash
npm run check
# Expected: ✓ MySQL: connected, ✓ Table posts: OK
```

/**
 * NewsFree365 — Background Worker
 *
 * Run as a dedicated PM2 process (newsfree365-worker) so background jobs are
 * isolated from the API process and never block HTTP responses.
 *
 * Cron jobs:
 *   1. Metrics aggregation   — every 2 min
 *   2. Ranking calculation   — every 3 min
 *   3. Scheduled publishing  — every 1 min
 *   4. Breaking/featured exp — every 5 min
 *   5. RSS ingest            — every N min (respects RSS_CRON_INTERVAL_MINUTES)
 *   6. Event cleanup         — daily at 03:00
 *
 * When WORKER_ENABLED=true the API server skips its own RSS cron so there
 * is no double-ingest.
 */

import cron from 'node-cron';
import { env } from '../config/env.js';
import { pingDb } from '../db/pool.js';
import { logMysqlStorageOnStartup } from '../db/storage-stats.js';
import { runMetricsAggregation } from '../services/metrics.service.js';
import { runRankingPass } from '../services/ranking.service.js';
import {
  publishScheduledArticles,
  expireBreakingNews,
  expireFeaturedArticles,
} from '../services/scheduler.service.js';
import { ingestFromRss } from '../services/ingestion.service.js';
import { pruneOldEvents } from '../models/events.model.js';
import { RANKING } from '../config/ranking.js';
import { checkAndRunAutomated10AmDigest } from '../controllers/newsletter.controller.js';

// ─── Startup ──────────────────────────────────────────────────────────────────

async function start() {
  try {
    await pingDb();
    console.log('[worker] MySQL pool connected');
    await logMysqlStorageOnStartup();
  } catch (e) {
    console.error('[worker] MySQL connection failed:', e.message);
    process.exit(1);
  }

  console.log('[worker] Background worker starting…');

  // ── 1. Metrics aggregation (every 2 min) ────────────────────────────────
  cron.schedule('*/2 * * * *', async () => {
    try {
      const r = await runMetricsAggregation();
      if (r.aggregated > 0) console.log('[worker] metrics:', r);
    } catch (e) {
      console.error('[worker] metrics error:', e.message);
    }
  });

  // ── 2. Ranking calculation (every 3 min) ────────────────────────────────
  cron.schedule('*/3 * * * *', async () => {
    try {
      const r = await runRankingPass();
      if (r.ranked > 0 || r.errors?.length) console.log('[worker] ranking:', r);
    } catch (e) {
      console.error('[worker] ranking error:', e.message);
    }
  });

  // ── 3. Scheduled publishing (every 1 min) ───────────────────────────────
  cron.schedule('* * * * *', async () => {
    try {
      const r = await publishScheduledArticles();
      if (r.published > 0) console.log('[worker] scheduler: published', r.published);
    } catch (e) {
      console.error('[worker] scheduler error:', e.message);
    }
  });

  // ── 4. Breaking/featured expiration (every 5 min) ───────────────────────
  cron.schedule('*/5 * * * *', async () => {
    try {
      const [brk, feat] = await Promise.all([expireBreakingNews(), expireFeaturedArticles()]);
      if (brk.expired > 0 || feat.expired > 0) {
        console.log('[worker] expiry: breaking=%d featured=%d', brk.expired, feat.expired);
      }
    } catch (e) {
      console.error('[worker] expiry error:', e.message);
    }
  });

  // ── 5. RSS ingest ────────────────────────────────────────────────────────
  const n = env.RSS_CRON_INTERVAL_MINUTES;
  cron.schedule(`*/${n} * * * *`, async () => {
    console.log('[worker] RSS ingest starting…');
    try {
      const r = await ingestFromRss();
      console.log('[worker] ingest done:', r);
    } catch (e) {
      console.error('[worker] ingest error:', e.message);
    }
  });
  console.log(`[worker] RSS ingest scheduled every ${n} min`);

  // ── 6. Event cleanup (daily at 03:00) ───────────────────────────────────
  cron.schedule('0 3 * * *', async () => {
    try {
      const deleted = await pruneOldEvents(RANKING.eventRetentionDays);
      console.log('[worker] cleanup: pruned %d old events', deleted);
    } catch (e) {
      console.error('[worker] cleanup error:', e.message);
    }
  });

  // ── 7. Daily 10:00 AM Newsletter Auto-Digest ─────────────────────────────
  cron.schedule('0 10 * * *', async () => {
    console.log('[worker] Checking 10:00 AM daily newsletter status…');
    try {
      const r = await checkAndRunAutomated10AmDigest();
      console.log('[worker] 10:00 AM newsletter result:', r);
    } catch (e) {
      console.error('[worker] 10:00 AM newsletter error:', e.message);
    }
  });

  console.log('[worker] All crons registered. Running.');
}

start();

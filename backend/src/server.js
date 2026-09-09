import cron from 'node-cron';
import app from './app.js';
import { env } from './config/env.js';
import { getFeedEntries } from './config/rss-feeds.js';
import { pingDb } from './db/pool.js';
import { logMysqlStorageOnStartup } from './db/storage-stats.js';
import { ingestFromRss } from './services/ingestion.service.js';
import { refreshTrendsCache } from './services/google-trends.service.js';
import { checkAndRunAutomated10AmDigest } from './controllers/newsletter.controller.js';

async function start() {
  try {
    await pingDb();
    console.log('MySQL pool connected');
    await logMysqlStorageOnStartup();
  } catch (e) {
    console.error('MySQL connection failed:', e.message);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`NewsFree365 API listening on http://localhost:${env.PORT}`);
  });

  const feedCount = getFeedEntries(env).length;
  if (env.CRON_ENABLED && !env.WORKER_ENABLED) {
    // When WORKER_ENABLED=true a dedicated newsfree365-worker PM2 process
    // runs the monitoring service — skip it here to avoid double-monitoring.
    const pollIntervalMs = Math.max(10000, env.RSS_POLL_INTERVAL || 60000);
    let isRssRunning = false;
    const runRssMonitor = async () => {
      if (isRssRunning) return;
      isRssRunning = true;
      console.log('[cron] RSS monitoring pass starting…');
      try {
        const { checkAllFeeds } = await import('./services/rss-monitor.service.js');
        const r = await checkAllFeeds();
        console.log(`[cron] RSS monitoring done: ${r.created} created, ${r.skipped} skipped, ${r.errors?.length || 0} errors`);
      } catch (e) {
        console.error('[cron] RSS monitoring error:', e);
      } finally {
        isRssRunning = false;
      }
    };
    setTimeout(runRssMonitor, 6000);
    setInterval(runRssMonitor, pollIntervalMs);
    console.log(`Cron: RSS monitoring scheduled every ${pollIntervalMs / 1000}s (${pollIntervalMs}ms)`);
  } else if (env.WORKER_ENABLED) {
    console.log('Cron: RSS monitoring delegated to newsfree365-worker process.');
  }

  if (env.CRON_ENABLED && env.TRENDS_ENABLED && env.TRENDS_CRON) {
    cron.schedule(env.TRENDS_CRON, async () => {
      console.log('[cron] Google Trends refresh starting…');
      try {
        const r = await refreshTrendsCache();
        console.log('[cron] trends done:', r);
      } catch (e) {
        console.error('[cron] trends error:', e);
      }
    });
    console.log(`Cron: Google Trends refresh (${env.TRENDS_CRON}, geo=${env.TRENDS_GEO})`);
  }

  if (env.CRON_ENABLED) {
    // Daily 10:00 AM Newsletter check (auto-broadcasts top stories if not sent manually today)
    cron.schedule('0 10 * * *', async () => {
      console.log('[cron] Checking 10:00 AM daily newsletter status…');
      try {
        const r = await checkAndRunAutomated10AmDigest();
        console.log('[cron] 10:00 AM newsletter result:', r);
      } catch (e) {
        console.error('[cron] 10:00 AM newsletter error:', e);
      }
    });
  }
}

start();

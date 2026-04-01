import cron from 'node-cron';
import app from './app.js';
import { env } from './config/env.js';
import { getFeedEntries } from './config/rss-feeds.js';
import { pingDb } from './db/pool.js';
import { logMysqlStorageOnStartup } from './db/storage-stats.js';
import { ingestFromRss } from './services/ingestion.service.js';
import { refreshTrendsCache } from './services/google-trends.service.js';

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
    console.log(`PolicyDrift API listening on http://localhost:${env.PORT}`);
  });

  const feedCount = getFeedEntries(env).length;
  if (env.CRON_ENABLED && feedCount > 0) {
    const n = env.RSS_CRON_INTERVAL_MINUTES;
    cron.schedule(`*/${n} * * * *`, async () => {
      console.log('[cron] RSS ingest starting…');
      try {
        const r = await ingestFromRss();
        console.log('[cron] ingest done:', r);
      } catch (e) {
        console.error('[cron] ingest error:', e);
      }
    });
    console.log(`Cron: RSS ingest every ${n} minute(s) (${feedCount} feed(s))`);
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
}

start();

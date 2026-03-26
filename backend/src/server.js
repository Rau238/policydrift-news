import cron from 'node-cron';
import app from './app.js';
import { env } from './config/env.js';
import { getFeedEntries } from './config/rss-feeds.js';
import { pingDb } from './db/pool.js';
import { ingestFromRss } from './services/ingestion.service.js';

async function start() {
  try {
    await pingDb();
    console.log('MySQL pool connected');
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
}

start();

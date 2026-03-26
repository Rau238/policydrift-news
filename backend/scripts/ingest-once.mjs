/**
 * Fetch all configured RSS feeds and insert new posts into MySQL (same logic as POST /api/posts/ingest).
 * Run from repo root:  npm run ingest
 */
import { ingestFromRss } from '../src/services/ingestion.service.js';
import { pool } from '../src/db/pool.js';
import { env } from '../src/config/env.js';
import { getFeedEntries } from '../src/config/rss-feeds.js';

console.log('\nPolicyDrift — RSS ingest\n');
const entries = getFeedEntries(env);
if (!entries.length) {
  console.error('No feeds: edit backend/src/config/rss-feeds.js and/or set RSS_FEED_URLS in .env\n');
  process.exit(1);
}

console.log(`  Feed URLs to fetch: ${entries.length} (from rss-feeds.js + optional RSS_FEED_URLS)\n`);if (env.RSS_MAX_ITEMS > 0) console.log(`  Cap: ${env.RSS_MAX_ITEMS} newest items (set RSS_MAX_ITEMS=0 for no cap)\n`);
else console.log('  Cap: none (all items from feeds)\n');

try {
  const r = await ingestFromRss();
  console.log(`  Created: ${r.created}`);
  console.log(`  Skipped (already in DB): ${r.skipped}`);
  if (r.errors.length) {
    console.log(`  Errors (${r.errors.length}):`);
    r.errors.slice(0, 15).forEach((e) => console.log(`    - ${e}`));
    if (r.errors.length > 15) console.log(`    … and ${r.errors.length - 15} more`);
  }
  console.log('');
  if (r.created === 0 && r.errors.length) process.exit(1);
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await pool.end();
}

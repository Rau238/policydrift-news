/**
 * One-shot Google Trends → MySQL cache. Requires TRENDS_ENABLED=true and trends_topics table.
 */
import { env } from '../src/config/env.js';
import { pingDb } from '../src/db/pool.js';
import { refreshTrendsCache } from '../src/services/google-trends.service.js';

async function main() {
  if (!env.TRENDS_ENABLED) {
    console.error('Set TRENDS_ENABLED=true in .env and run sql/table-trends-topics.sql first.');
    process.exit(1);
  }
  await pingDb();
  const r = await refreshTrendsCache();
  console.log(r);
  process.exit(r.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

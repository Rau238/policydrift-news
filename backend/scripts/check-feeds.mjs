/**
 * Probe every configured RSS URL. Usage (repo root):
 *   npm run feeds:check
 */
import { env } from '../src/config/env.js';
import { getFeedEntries } from '../src/config/rss-feeds.js';
import { fetchFeedItems } from '../src/services/rss.service.js';

const entries = getFeedEntries(env);
console.log(`\nChecking ${entries.length} RSS feeds…\n`);

let ok = 0;
let fail = 0;
for (const { url, category } of entries) {
  try {
    const items = await fetchFeedItems(url, category);
    ok += 1;
    console.log(`OK   ${String(items.length).padStart(3)}  [${category}] ${url}`);
  } catch (e) {
    fail += 1;
    console.log(`FAIL      [${category}] ${url}`);
    console.log(`       ${e.message}`);
  }
}

console.log(`\nDone: ${ok} ok, ${fail} failed (of ${entries.length})\n`);
process.exit(fail > 0 ? 1 : 0);

import { pool } from '../db/pool.js';

/**
 * Prune automated scraped articles older than `retentionDays` in safe batches.
 * CRITICAL RULE: User/Admin-authored stories (source_id IS NULL or is_featured = 1 or editorial_priority = 'pinned')
 * are permanently preserved and NEVER deleted.
 */
export async function pruneOldArticles(retentionDays = 10) {
  console.log('[prune] Article retention pruning is PERMANENTLY DISABLED. All articles remain live.');
  return {
    deletedPosts: 0,
    deletedMetrics: 0,
    deletedEvents: 0,
    message: 'Article deletion disabled per configuration. All articles remain permanently live.',
  };
}

if (process.argv[1]?.endsWith('prune-db.mjs')) {
  pruneOldArticles(10)
    .then((res) => {
      console.log('[prune] Finished successfully:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[prune] Error:', err);
      process.exit(1);
    });
}

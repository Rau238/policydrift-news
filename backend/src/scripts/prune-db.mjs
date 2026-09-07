import { pool } from '../db/pool.js';

/**
 * Prune automated scraped articles older than `retentionDays` in safe batches.
 * CRITICAL RULE: User/Admin-authored stories (source_id IS NULL or is_featured = 1 or editorial_priority = 'pinned')
 * are permanently preserved and NEVER deleted.
 */
export async function pruneOldArticles(retentionDays = 10) {
  const days = Math.max(1, parseInt(retentionDays, 10) || 10);
  console.log(`[prune] Starting cleanup of automated scraped articles older than ${days} days (Authored stories are EXEMPT)...`);

  const [countRes] = await pool.query(
    `SELECT COUNT(*) AS count FROM posts 
     WHERE published_at < DATE_SUB(NOW(), INTERVAL ? DAY)
       AND source_id IS NOT NULL
       AND is_featured = 0
       AND (editorial_priority IS NULL OR editorial_priority != 'pinned')`,
    [days]
  );
  const totalOld = countRes[0]?.count || 0;
  console.log(`[prune] Found ${totalOld} automated articles older than ${days} days to remove.`);

  if (totalOld === 0) {
    console.log('[prune] No old scraped articles to prune.');
    return { deletedPosts: 0, deletedMetrics: 0, deletedEvents: 0 };
  }

  let totalDeleted = 0;
  const batchSize = 2000;

  while (true) {
    // Delete in chunk by ID range to avoid long table locks
    const [idRows] = await pool.query(
      `SELECT id FROM posts 
       WHERE published_at < DATE_SUB(NOW(), INTERVAL ? DAY)
         AND source_id IS NOT NULL
         AND is_featured = 0
         AND (editorial_priority IS NULL OR editorial_priority != 'pinned')
       LIMIT ?`,
      [days, batchSize]
    );

    if (!idRows.length) break;

    const ids = idRows.map((r) => r.id);

    // 1. Delete associated metrics
    await pool.query(`DELETE FROM post_metrics WHERE post_id IN (?)`, [ids]);
    // 2. Delete associated events
    await pool.query(`DELETE FROM post_events WHERE post_id IN (?)`, [ids]);
    // 3. Delete posts
    const [delRes] = await pool.query(`DELETE FROM posts WHERE id IN (?)`, [ids]);

    totalDeleted += delRes.affectedRows || ids.length;
    console.log(`[prune] Deleted batch of ${delRes.affectedRows || ids.length} articles (Total: ${totalDeleted}/${totalOld})...`);

    // Tiny 50ms pause to let other queries through
    await new Promise((r) => setTimeout(r, 50));
  }

  // Also purge any lingering orphaned metrics or events
  const [metricCleanup] = await pool.query(`
    DELETE pm FROM post_metrics pm
    LEFT JOIN posts p ON pm.post_id = p.id
    WHERE p.id IS NULL
  `);

  const [eventCleanup] = await pool.query(`
    DELETE pe FROM post_events pe
    LEFT JOIN posts p ON pe.post_id = p.id
    WHERE p.id IS NULL
  `);

  console.log(`[prune] Pruning complete: ${totalDeleted} posts deleted.`);
  console.log(`[prune] Cleaned up ${metricCleanup.affectedRows || 0} orphaned metrics and ${eventCleanup.affectedRows || 0} orphaned events.`);

  return {
    deletedPosts: totalDeleted,
    deletedMetrics: metricCleanup.affectedRows || 0,
    deletedEvents: eventCleanup.affectedRows || 0,
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

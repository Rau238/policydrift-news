import { pool } from '../db/pool.js';

async function addIndexIfNotExists(table, indexName, columnsDef) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, indexName]
  );
  if (rows.length === 0) {
    console.log(`Adding index ${indexName} on ${table}(${columnsDef})...`);
    await pool.query(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${columnsDef})`);
    console.log(`Index ${indexName} added successfully.`);
  } else {
    console.log(`Index ${indexName} already exists on ${table}.`);
  }
}

export async function setupPerformanceIndexes() {
  console.log('[indexes] Setting up high-performance database indexes...');
  
  // Composite indexes on posts
  await addIndexIfNotExists('posts', 'idx_status_pub', '`status`, `published_at` DESC');
  await addIndexIfNotExists('posts', 'idx_status_cat_pub', '`status`, `category`, `published_at` DESC');
  await addIndexIfNotExists('posts', 'idx_breaking_status_pub', '`is_breaking`, `status`, `published_at` DESC');
  await addIndexIfNotExists('posts', 'idx_featured_status_pub', '`is_featured`, `status`, `published_at` DESC');

  // Indexes on post_metrics
  await addIndexIfNotExists('post_metrics', 'idx_pm_views24h', '`views_24h` DESC');
  await addIndexIfNotExists('post_metrics', 'idx_pm_views7d', '`views_7d` DESC');
  await addIndexIfNotExists('post_metrics', 'idx_pm_views30d', '`views_30d` DESC');

  console.log('[indexes] All performance indexes verified.');
}

if (process.argv[1]?.endsWith('add-perf-indexes.mjs')) {
  setupPerformanceIndexes()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

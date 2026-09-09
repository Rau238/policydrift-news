import { pool } from '../db/pool.js';

async function run() {
  console.log('Starting RSS migration in single batch...');

  // 1. Check which columns already exist
  const [cols] = await pool.query(
    'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "posts"',
  );
  const existingCols = new Set(cols.map((c) => c.COLUMN_NAME));

  const additions = [];
  if (!existingCols.has('guid')) {
    additions.push('ADD COLUMN `guid` VARCHAR(512) NULL');
  }
  if (!existingCols.has('content_available')) {
    additions.push('ADD COLUMN `content_available` TINYINT(1) NOT NULL DEFAULT 0');
  }
  if (!existingCols.has('extraction_status')) {
    additions.push("ADD COLUMN `extraction_status` ENUM('full','rss_only','failed') NOT NULL DEFAULT 'rss_only'");
  }
  if (!existingCols.has('discovered_at')) {
    additions.push('ADD COLUMN `discovered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
  }

  // 2. Check indexes
  const [indexes] = await pool.query(
    'SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "posts"',
  );
  const existingIndexes = new Set(indexes.map((i) => i.INDEX_NAME));

  if (!existingIndexes.has('idx_guid') && (!existingCols.has('guid') || additions.length > 0)) {
    additions.push('ADD INDEX `idx_guid` (`guid`(191))');
  }
  if (!existingIndexes.has('idx_extraction_status')) {
    additions.push('ADD INDEX `idx_extraction_status` (`extraction_status`)');
  }
  if (!existingIndexes.has('idx_discovered_at')) {
    additions.push('ADD INDEX `idx_discovered_at` (`discovered_at`)');
  }

  if (additions.length > 0) {
    console.log(`Altering posts table with ${additions.length} operations in 1 batch:`);
    console.log(additions.join(',\n'));
    const sql = `ALTER TABLE \`posts\` ${additions.join(', ')}`;
    const t0 = Date.now();
    await pool.query(sql);
    console.log(`Posts table altered successfully in ${(Date.now() - t0) / 1000}s`);
  } else {
    console.log('Posts table already has all RSS columns and indexes.');
  }

  // 3. Check news_sources
  const [sCols] = await pool.query(
    'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "news_sources" AND COLUMN_NAME = "last_checked_at"',
  );
  if (sCols.length === 0) {
    console.log('Adding last_checked_at to news_sources...');
    await pool.query('ALTER TABLE `news_sources` ADD COLUMN `last_checked_at` DATETIME NULL');
    console.log('Added last_checked_at to news_sources');
  } else {
    console.log('Column last_checked_at already exists in news_sources');
  }

  console.log('ALL RSS MIGRATIONS COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

run().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});

-- =============================================================================
-- PolicyDrift v2 — incremental migration  (MySQL 8+)
--
-- Designed for the ACTUAL production schema (inspected 2026-08-14).
-- Existing tables kept intact; only additive changes.
--
-- Run once:
--   "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" \
--     -u root -proot policydrift_news < backend/sql/migration-v2.sql
-- =============================================================================

USE policydrift_news;

-- ─── Idempotent helpers ───────────────────────────────────────────────────────
DELIMITER $$

DROP PROCEDURE IF EXISTS _pd_add_col$$
CREATE PROCEDURE _pd_add_col(IN p_table VARCHAR(64), IN p_col VARCHAR(64), IN p_def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_col
  ) THEN
    SET @_ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_col, '` ', p_def);
    PREPARE _st FROM @_ddl; EXECUTE _st; DEALLOCATE PREPARE _st;
  END IF;
END$$

DROP PROCEDURE IF EXISTS _pd_add_idx$$
CREATE PROCEDURE _pd_add_idx(IN p_table VARCHAR(64), IN p_idx VARCHAR(64), IN p_cols TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND INDEX_NAME = p_idx
  ) THEN
    SET @_ddl = CONCAT('ALTER TABLE `', p_table, '` ADD INDEX `', p_idx, '` (', p_cols, ')');
    PREPARE _st FROM @_ddl; EXECUTE _st; DEALLOCATE PREPARE _st;
  END IF;
END$$

DELIMITER ;

-- =============================================================================
-- 1. EXTEND `posts`
-- Existing columns kept as-is:
--   tags(json), status(enum), rejection_reason, approved_by, approved_at,
--   auto_published, post_kind, score, engagement_score, clicks, avg_time_on_page
-- =============================================================================

-- Extend status enum to include v2 workflow values (non-destructive)
ALTER TABLE posts MODIFY COLUMN `status`
  ENUM('draft','pending','processing','approved','published','rejected','archived')
  NOT NULL DEFAULT 'published';

-- Editorial controls
CALL _pd_add_col('posts', 'is_featured',       'TINYINT UNSIGNED NOT NULL DEFAULT 0');
CALL _pd_add_col('posts', 'is_breaking',        'TINYINT UNSIGNED NOT NULL DEFAULT 0');
CALL _pd_add_col('posts', 'breaking_until',     'DATETIME NULL');
CALL _pd_add_col('posts', 'featured_until',     'DATETIME NULL');
CALL _pd_add_col('posts', 'editorial_priority',
  "ENUM('normal','high','pinned') NOT NULL DEFAULT 'normal'");

-- Attribution & scheduling
CALL _pd_add_col('posts', 'author',             'VARCHAR(255) NULL');
CALL _pd_add_col('posts', 'scheduled_at',       'DATETIME NULL');

-- Engagement counters (denormalised; updated by metrics worker)
CALL _pd_add_col('posts', 'like_count',         'INT UNSIGNED NOT NULL DEFAULT 0');
CALL _pd_add_col('posts', 'comment_count',      'INT UNSIGNED NOT NULL DEFAULT 0');
CALL _pd_add_col('posts', 'share_count',        'INT UNSIGNED NOT NULL DEFAULT 0');
CALL _pd_add_col('posts', 'bookmark_count',     'INT UNSIGNED NOT NULL DEFAULT 0');

-- Estimated reading time
CALL _pd_add_col('posts', 'reading_time_minutes', 'TINYINT UNSIGNED NOT NULL DEFAULT 0');

-- Content hash for title-level dedup (separate from url_hash)
CALL _pd_add_col('posts', 'content_hash',       'CHAR(64) NULL');

-- FK to managed source catalogue
CALL _pd_add_col('posts', 'source_id',          'INT UNSIGNED NULL');

-- New indexes (skip any that already exist)
CALL _pd_add_idx('posts', 'idx_breaking',       '`is_breaking`, `breaking_until`');
CALL _pd_add_idx('posts', 'idx_featured',       '`is_featured`');
CALL _pd_add_idx('posts', 'idx_scheduled',      '`scheduled_at`');
CALL _pd_add_idx('posts', 'idx_source_id',      '`source_id`');
CALL _pd_add_idx('posts', 'idx_content_hash',   '`content_hash`');

-- =============================================================================
-- 2. EXTEND `news_sources`  (existing table — additive columns only)
-- Existing columns: id, name, source_type, url, category, is_active,
--   fetch_interval_minutes, last_fetched_at, reliability_score
-- =============================================================================

-- v2 additions
CALL _pd_add_col('news_sources', 'rss_url',          'VARCHAR(2048) NULL');
CALL _pd_add_col('news_sources', 'api_url',           'VARCHAR(2048) NULL');
CALL _pd_add_col('news_sources', 'logo',              'VARCHAR(2048) NULL');
CALL _pd_add_col('news_sources', 'description',       'TEXT NULL');
CALL _pd_add_col('news_sources', 'country',           "VARCHAR(8) NOT NULL DEFAULT 'IN'");
CALL _pd_add_col('news_sources', 'language',          "VARCHAR(8) NOT NULL DEFAULT 'en'");
-- trust_score: integer 0-100 (maps from reliability_score * 100)
CALL _pd_add_col('news_sources', 'trust_score',
  'TINYINT UNSIGNED NOT NULL DEFAULT 70 COMMENT "0-100 ranking factor"');
CALL _pd_add_col('news_sources', 'last_success_at',   'DATETIME NULL');
CALL _pd_add_col('news_sources', 'last_error',        'TEXT NULL');
CALL _pd_add_col('news_sources', 'articles_imported', 'INT UNSIGNED NOT NULL DEFAULT 0');

-- Backfill rss_url from url for existing RSS sources
UPDATE news_sources
SET rss_url = url
WHERE source_type = 'rss' AND rss_url IS NULL;

-- Backfill trust_score from reliability_score (0-1 → 0-100)
UPDATE news_sources
SET trust_score = LEAST(100, GREATEST(0, ROUND(reliability_score * 100)))
WHERE reliability_score IS NOT NULL AND trust_score = 70;

-- =============================================================================
-- 3. POST_EVENTS — IP-hash based event dedup (ranking + velocity)
--    (separate from existing post_analytics; keeps user_ip private)
-- =============================================================================

CREATE TABLE IF NOT EXISTS post_events (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id    INT UNSIGNED    NOT NULL,
  event_type ENUM('view','like','share','bookmark','comment','click') NOT NULL,
  user_id    INT UNSIGNED    NULL,
  session_id VARCHAR(128)    NULL,
  ip_hash    CHAR(64)        NULL  COMMENT 'SHA-256 of IP — never stored raw',
  metadata   JSON            NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pe_post_event   (post_id, event_type),
  KEY idx_pe_post_created (post_id, created_at),
  KEY idx_pe_event_created(event_type, created_at),
  KEY idx_pe_dedup        (post_id, event_type, ip_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. POST_METRICS — aggregated counters + ranking scores
-- =============================================================================

CREATE TABLE IF NOT EXISTS post_metrics (
  post_id INT UNSIGNED NOT NULL,

  views_5m   INT UNSIGNED NOT NULL DEFAULT 0,
  views_30m  INT UNSIGNED NOT NULL DEFAULT 0,
  views_1h   INT UNSIGNED NOT NULL DEFAULT 0,
  views_6h   INT UNSIGNED NOT NULL DEFAULT 0,
  views_24h  INT UNSIGNED NOT NULL DEFAULT 0,
  views_7d   INT UNSIGNED NOT NULL DEFAULT 0,
  views_30d  INT UNSIGNED NOT NULL DEFAULT 0,

  likes_1h      INT UNSIGNED NOT NULL DEFAULT 0,
  likes_24h     INT UNSIGNED NOT NULL DEFAULT 0,
  shares_1h     INT UNSIGNED NOT NULL DEFAULT 0,
  shares_24h    INT UNSIGNED NOT NULL DEFAULT 0,
  comments_1h   INT UNSIGNED NOT NULL DEFAULT 0,
  bookmarks_24h INT UNSIGNED NOT NULL DEFAULT 0,

  freshness_score  DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  engagement_score DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  velocity_score   DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  source_score     DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  editorial_score  DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  trending_score   DECIMAL(10,6) NOT NULL DEFAULT 0.000000,
  top_score        DECIMAL(10,6) NOT NULL DEFAULT 0.000000,

  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (post_id),
  KEY idx_pm_trending (trending_score),
  KEY idx_pm_top      (top_score),
  KEY idx_pm_updated  (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. Clean up helper procedures
-- =============================================================================

DROP PROCEDURE IF EXISTS _pd_add_col;
DROP PROCEDURE IF EXISTS _pd_add_idx;

-- =============================================================================
-- Verify: SHOW COLUMNS FROM posts; SHOW COLUMNS FROM news_sources; SHOW TABLES;
-- =============================================================================

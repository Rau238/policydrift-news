-- =============================================================================
-- NewsFree365 — RSS News Monitoring & Extraction Migration
-- Idempotently extends `posts` and `news_sources` tables for RSS article
-- tracking, duplicate prevention, and extraction status.
-- =============================================================================

USE policydrift_news;

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

-- 1. Extend `posts` table
CALL _pd_add_col('posts', 'guid',              'VARCHAR(512) NULL');
CALL _pd_add_col('posts', 'content_available', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL _pd_add_col('posts', 'extraction_status', "ENUM('full','rss_only','failed') NOT NULL DEFAULT 'rss_only'");
CALL _pd_add_col('posts', 'discovered_at',     'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');

CALL _pd_add_idx('posts', 'idx_guid',          '`guid`(191)');
CALL _pd_add_idx('posts', 'idx_extraction_status', '`extraction_status`');
CALL _pd_add_idx('posts', 'idx_discovered_at', '`discovered_at`');

-- 2. Extend `news_sources` table
CALL _pd_add_col('news_sources', 'last_checked_at', 'DATETIME NULL');

-- Clean up helpers
DROP PROCEDURE IF EXISTS _pd_add_col;
DROP PROCEDURE IF EXISTS _pd_add_idx;

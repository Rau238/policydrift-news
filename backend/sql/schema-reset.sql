-- =============================================================================
-- PolicyDrift — RESET: deletes all posts and recreates empty `posts` table.
-- Database `policydrift` is kept. Run: mysql -u root -p < backend/sql/schema-reset.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS policydrift
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE policydrift;

DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(320) NOT NULL,
  title VARCHAR(512) NOT NULL,
  excerpt TEXT NULL,
  key_takeaways TEXT NULL,
  body LONGTEXT NOT NULL,
  original_url VARCHAR(2048) NOT NULL,
  url_hash CHAR(64) NOT NULL,
  image_url VARCHAR(2048) NULL,
  category VARCHAR(128) NOT NULL DEFAULT 'General',
  view_count INT UNSIGNED NOT NULL DEFAULT 0,
  published_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  source_feed VARCHAR(512) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_url_hash (url_hash),
  UNIQUE KEY uq_slug (slug),
  KEY idx_category (category),
  KEY idx_published (published_at),
  KEY idx_views (view_count),
  KEY idx_trending (published_at, view_count)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

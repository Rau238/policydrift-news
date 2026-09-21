-- =============================================================================
-- NewsFree365 / PolicyDrift — Complete Unified Production MySQL Schema (v2.0)
-- MySQL 8.0+ / MariaDB 10.5+
--
-- Database: policydrift_news
--
-- Run to initialize or restore schema:
--   mysql -u root -p policydrift_news < backend/sql/schema.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS policydrift_news
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE policydrift_news;

-- -----------------------------------------------------------------------------
-- 1. POSTS — Main News Articles, Visual Stories & Editorial Content
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
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
  source_id INT UNSIGNED NULL,
  tags JSON NULL,
  status ENUM('draft','pending','processing','approved','published','rejected','archived') NOT NULL DEFAULT 'published',
  rejection_reason TEXT NULL,
  approved_by VARCHAR(128) NULL,
  approved_at DATETIME NULL,
  auto_published TINYINT(1) NOT NULL DEFAULT 0,
  post_kind ENUM('standard','visual_story','curated','breaking') NOT NULL DEFAULT 'standard',
  score INT NOT NULL DEFAULT 0,
  engagement_score DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  clicks INT UNSIGNED NOT NULL DEFAULT 0,
  avg_time_on_page INT UNSIGNED NOT NULL DEFAULT 0,
  is_featured TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_breaking TINYINT UNSIGNED NOT NULL DEFAULT 0,
  breaking_until DATETIME NULL,
  featured_until DATETIME NULL,
  editorial_priority ENUM('normal','high','pinned') NOT NULL DEFAULT 'normal',
  author VARCHAR(255) NULL,
  scheduled_at DATETIME NULL,
  like_count INT UNSIGNED NOT NULL DEFAULT 0,
  comment_count INT UNSIGNED NOT NULL DEFAULT 0,
  share_count INT UNSIGNED NOT NULL DEFAULT 0,
  bookmark_count INT UNSIGNED NOT NULL DEFAULT 0,
  reading_time_minutes TINYINT UNSIGNED NOT NULL DEFAULT 0,
  content_hash CHAR(64) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_url_hash (url_hash),
  UNIQUE KEY uq_slug (slug),
  KEY idx_category (category),
  KEY idx_published (published_at),
  KEY idx_status_published (status, published_at DESC),
  KEY idx_views (view_count),
  KEY idx_trending (published_at, view_count),
  KEY idx_breaking (is_breaking, breaking_until),
  KEY idx_featured (is_featured),
  KEY idx_scheduled (scheduled_at),
  KEY idx_source_id (source_id),
  KEY idx_content_hash (content_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. NEWS_SOURCES — Managed RSS & API News Feed Registry
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_sources (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(32) NOT NULL DEFAULT 'rss',
  url VARCHAR(2048) NOT NULL,
  rss_url VARCHAR(2048) NULL,
  api_url VARCHAR(2048) NULL,
  logo VARCHAR(2048) NULL,
  description TEXT NULL,
  category VARCHAR(128) NOT NULL DEFAULT 'General',
  country VARCHAR(8) NOT NULL DEFAULT 'IN',
  language VARCHAR(8) NOT NULL DEFAULT 'en',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  fetch_interval_minutes INT UNSIGNED NOT NULL DEFAULT 15,
  last_fetched_at DATETIME NULL,
  last_success_at DATETIME NULL,
  last_error TEXT NULL,
  reliability_score DECIMAL(4,3) NOT NULL DEFAULT 0.700,
  trust_score TINYINT UNSIGNED NOT NULL DEFAULT 70 COMMENT '0-100 ranking factor',
  articles_imported INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_active_fetched (is_active, last_fetched_at),
  KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. POST_EVENTS — Privacy-Preserving Event Stream (Views, Shares, Clicks)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id INT UNSIGNED NOT NULL,
  event_type ENUM('view','like','share','bookmark','comment','click') NOT NULL,
  user_id INT UNSIGNED NULL,
  session_id VARCHAR(128) NULL,
  ip_hash CHAR(64) NULL COMMENT 'SHA-256 hash of IP address',
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pe_post_event (post_id, event_type),
  KEY idx_pe_post_created (post_id, created_at),
  KEY idx_pe_event_created (event_type, created_at),
  KEY idx_pe_dedup (post_id, event_type, ip_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. POST_METRICS — Aggregated Velocity, Freshness & Ranking Scores
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_metrics (
  post_id INT UNSIGNED NOT NULL,
  views_5m INT UNSIGNED NOT NULL DEFAULT 0,
  views_30m INT UNSIGNED NOT NULL DEFAULT 0,
  views_1h INT UNSIGNED NOT NULL DEFAULT 0,
  views_6h INT UNSIGNED NOT NULL DEFAULT 0,
  views_24h INT UNSIGNED NOT NULL DEFAULT 0,
  views_7d INT UNSIGNED NOT NULL DEFAULT 0,
  views_30d INT UNSIGNED NOT NULL DEFAULT 0,
  likes_1h INT UNSIGNED NOT NULL DEFAULT 0,
  likes_24h INT UNSIGNED NOT NULL DEFAULT 0,
  shares_1h INT UNSIGNED NOT NULL DEFAULT 0,
  shares_24h INT UNSIGNED NOT NULL DEFAULT 0,
  comments_1h INT UNSIGNED NOT NULL DEFAULT 0,
  bookmarks_24h INT UNSIGNED NOT NULL DEFAULT 0,
  freshness_score DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  engagement_score DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  velocity_score DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  source_score DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  editorial_score DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  trending_score DECIMAL(10,6) NOT NULL DEFAULT 0.000000,
  top_score DECIMAL(10,6) NOT NULL DEFAULT 0.000000,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id),
  KEY idx_pm_trending (trending_score),
  KEY idx_pm_top (top_score),
  KEY idx_pm_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TRENDS_TOPICS — Google Trends & Discovery Topics
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trends_topics (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  geo VARCHAR(8) NOT NULL,
  category_key VARCHAR(64) NOT NULL,
  query_text VARCHAR(512) NOT NULL,
  trend_label VARCHAR(32) NULL,
  value_score INT UNSIGNED NULL,
  seed_keyword VARCHAR(128) NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'related',
  timeframe VARCHAR(8) NOT NULL DEFAULT '30d',
  why_context TEXT NULL,
  traffic_note VARCHAR(64) NULL,
  fetched_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_geo_fetched (geo, fetched_at),
  KEY idx_geo_timeframe (geo, timeframe),
  KEY idx_category (category_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. CALENDAR_EVENTS — Macroeconomic, Holidays, Earnings & Dividends Calendar
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar_events (
  id VARCHAR(128) PRIMARY KEY,
  event_type VARCHAR(32) NOT NULL,
  category VARCHAR(64) NULL,
  title VARCHAR(255) NOT NULL,
  country VARCHAR(16) NOT NULL DEFAULT 'IN',
  country_name VARCHAR(64) NULL,
  flag VARCHAR(32) NULL,
  authority VARCHAR(255) NULL,
  event_date DATE NOT NULL,
  event_time VARCHAR(64) DEFAULT 'All Day',
  impact VARCHAR(16) DEFAULT 'medium',
  forecast VARCHAR(64) NULL,
  previous VARCHAR(64) NULL,
  actual VARCHAR(64) NULL,
  unit VARCHAR(64) NULL,
  session_status VARCHAR(255) NULL,
  exchanges TEXT NULL,
  symbol VARCHAR(64) NULL,
  quarter VARCHAR(32) NULL,
  estimate_eps VARCHAR(64) NULL,
  estimate_revenue VARCHAR(64) NULL,
  issue_size VARCHAR(64) NULL,
  price_band VARCHAR(64) NULL,
  lot_size VARCHAR(64) NULL,
  subscription_status VARCHAR(64) NULL,
  amount VARCHAR(64) NULL,
  record_date VARCHAR(64) NULL,
  yield_percent VARCHAR(32) NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_custom TINYINT(1) NOT NULL DEFAULT 0,
  source_url VARCHAR(512) NULL,
  last_synced_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_event_date (event_date),
  INDEX idx_event_type (event_type),
  INDEX idx_country (country),
  INDEX idx_is_active (is_active),
  INDEX idx_impact (impact)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. NEWS_QUIZ_QUESTIONS — Daily Interactive News Intelligence Quiz
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  edition_date VARCHAR(32) NOT NULL DEFAULT '',
  category VARCHAR(128) NOT NULL DEFAULT 'World Policy & Geopolitics',
  category_slug VARCHAR(64) NOT NULL DEFAULT 'world-news',
  question TEXT NOT NULL,
  options JSON NOT NULL,
  correct_index INT NOT NULL DEFAULT 0,
  explanation TEXT NOT NULL,
  audience_votes JSON NOT NULL,
  key_term VARCHAR(128) NOT NULL DEFAULT '',
  order_num INT NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_edition_active (edition_date, is_active, order_num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. NEWS_POLLS & NEWS_POLL_VOTES — Interactive Opinion Poll of the Day
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_polls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  category VARCHAR(64) NOT NULL DEFAULT 'General',
  options JSON NOT NULL,
  total_votes INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_created (is_active, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_poll_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poll_id INT NOT NULL,
  option_id VARCHAR(64) NOT NULL,
  voter_hash VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_poll_voter (poll_id, voter_hash),
  INDEX idx_poll_id (poll_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. NEWS_PUSH_SUBSCRIPTIONS — Web Push Notification Subscribers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  endpoint VARCHAR(768) NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  user_agent VARCHAR(512) NULL,
  ip_address VARCHAR(64) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_endpoint (endpoint(255)),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. NEWS_NEWSLETTER_SUBSCRIBERS & DISPATCHES — Email Intelligence Briefings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(128) NULL,
  frequency VARCHAR(32) NOT NULL DEFAULT 'daily',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  unsubscribe_token VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_frequency (is_active, frequency),
  INDEX idx_token (unsubscribe_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_newsletter_dispatches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  headline VARCHAR(255) NOT NULL,
  story_ids JSON NULL,
  recipient_count INT NOT NULL DEFAULT 0,
  dispatch_type ENUM('manual', 'automated_10am') NOT NULL DEFAULT 'manual',
  sent_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sent_date (sent_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. NEWS_SOCIAL_POSTS_LOG — Automated Social Channel Publishing Audit
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_social_posts_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NULL,
  category VARCHAR(100) NULL,
  channels JSON NOT NULL,
  captions JSON NULL,
  image_url VARCHAR(1000) NULL,
  status ENUM('success', 'failed', 'partial') NOT NULL DEFAULT 'success',
  results JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at),
  INDEX idx_article (article_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

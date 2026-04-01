-- Google Trends cache (refreshed by cron / npm run trends)
USE policydrift_news;

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

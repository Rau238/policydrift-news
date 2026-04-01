-- Add timeframe buckets (24h / 7d / 30d) and optional "why trending" context.
-- Run after table exists: mysql -u ... policydrift_news < backend/sql/migration-trends-timeframe-why.sql

USE policydrift_news;

ALTER TABLE trends_topics
  ADD COLUMN timeframe VARCHAR(8) NOT NULL DEFAULT '30d' AFTER source,
  ADD COLUMN why_context TEXT NULL AFTER timeframe,
  ADD COLUMN traffic_note VARCHAR(64) NULL AFTER why_context,
  ADD KEY idx_geo_timeframe (geo, timeframe);

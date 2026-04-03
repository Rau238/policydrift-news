-- Key takeaways: desk summary for select categories (E-E-A-T / original framing on syndicated items).
-- Run: mysql -u root -p policydrift < backend/sql/migration-posts-key-takeaways.sql

USE policydrift_news;

ALTER TABLE posts
  ADD COLUMN key_takeaways TEXT NULL AFTER excerpt;

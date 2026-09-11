import { pool } from '../db/pool.js';

let tableEnsured = false;

export async function ensureSocialLogTableExists() {
  if (tableEnsured) return;
  const sql = `
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
  `;
  try {
    await pool.query(sql);
    tableEnsured = true;
  } catch (err) {
    console.warn('[social-log.model] Table initialization notice:', err.message);
  }
}

/**
 * Record a social publishing event into persistent MySQL storage
 */
export async function saveSocialLog({
  articleId = null,
  title,
  slug = null,
  category = null,
  channels = [],
  captions = {},
  imageUrl = null,
  status = 'success',
  results = {},
}) {
  await ensureSocialLogTableExists();
  const sql = `
    INSERT INTO news_social_posts_log
      (article_id, title, slug, category, channels, captions, image_url, status, results, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  try {
    const [result] = await pool.query(sql, [
      articleId ? Number(articleId) : null,
      String(title || 'Untitled Post').slice(0, 500),
      slug ? String(slug).slice(0, 500) : null,
      category ? String(category).slice(0, 100) : null,
      JSON.stringify(channels || []),
      JSON.stringify(captions || {}),
      imageUrl ? String(imageUrl).slice(0, 1000) : null,
      status,
      JSON.stringify(results || {}),
    ]);
    return { id: result.insertId, title, status };
  } catch (err) {
    console.error('[social-log.model] Failed to save social post log:', err.message);
    return null;
  }
}

/**
 * Fetch recent social publishing logs with pagination
 */
export async function getSocialLogs(limit = 50, offset = 0) {
  await ensureSocialLogTableExists();
  const sql = `
    SELECT
      id,
      article_id as articleId,
      title,
      slug,
      category,
      channels,
      captions,
      image_url as imageUrl,
      status,
      results,
      created_at as createdAt,
      created_at as timestamp
    FROM news_social_posts_log
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;
  try {
    const [rows] = await pool.query(sql, [Number(limit), Number(offset)]);
    return rows.map((r) => {
      let channels = [];
      let captions = {};
      let results = {};

      try {
        channels = typeof r.channels === 'string' ? JSON.parse(r.channels) : r.channels || [];
      } catch {
        channels = [];
      }

      try {
        captions = typeof r.captions === 'string' ? JSON.parse(r.captions) : r.captions || {};
      } catch {
        captions = {};
      }

      try {
        results = typeof r.results === 'string' ? JSON.parse(r.results) : r.results || {};
      } catch {
        results = {};
      }

      return {
        ...r,
        channels,
        captions,
        results,
      };
    });
  } catch (err) {
    console.error('[social-log.model] Failed to fetch social logs:', err.message);
    return [];
  }
}

/**
 * Delete a specific social post log
 */
export async function deleteSocialLog(id) {
  await ensureSocialLogTableExists();
  const sql = `DELETE FROM news_social_posts_log WHERE id = ?`;
  const [res] = await pool.query(sql, [Number(id)]);
  return res.affectedRows > 0;
}

/**
 * Clear all social post logs
 */
export async function clearAllSocialLogs() {
  await ensureSocialLogTableExists();
  const sql = `DELETE FROM news_social_posts_log`;
  const [res] = await pool.query(sql);
  return res.affectedRows;
}

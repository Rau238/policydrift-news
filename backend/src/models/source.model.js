/**
 * Source model — adapts to the ACTUAL `news_sources` schema.
 *
 * Existing columns: id, name, source_type, url, category, is_active,
 *   fetch_interval_minutes, last_fetched_at, reliability_score
 * v2 additions (migration-v2.sql): rss_url, api_url, logo, description,
 *   country, language, trust_score, last_success_at, last_error, articles_imported
 *
 * rss_url wins over url for feed fetching; falls back to url when rss_url is NULL.
 */

import { pool } from '../db/pool.js';

const SELECT_COLS = `
  id, name, source_type,
  COALESCE(rss_url, IF(source_type='rss', url, NULL)) AS rss_url,
  api_url, url, logo, description,
  country, language, category,
  trust_score, is_active AS enabled,
  fetch_interval_minutes,
  last_fetched_at, last_success_at, last_error,
  articles_imported, reliability_score,
  created_at, updated_at
`.trim();

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function listSources({ includeDisabled = false } = {}) {
  const where = includeDisabled ? '1=1' : 'is_active = 1';
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLS} FROM news_sources WHERE ${where} ORDER BY category, name`,
  );
  return rows;
}

export async function getSourceById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLS} FROM news_sources WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

export async function countSources() {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS n FROM news_sources WHERE is_active = 1',
  );
  return rows[0]?.n ?? 0;
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function createSource({
  name, rss_url = null, api_url = null, url = null,
  logo = null, description = null,
  country = 'IN', language = 'en', category = 'General',
  trust_score = 70, is_active = 1, fetch_interval_minutes = 15,
}) {
  const feedUrl = rss_url || url || '';
  const [result] = await pool.query(
    `INSERT INTO news_sources
       (name, source_type, url, rss_url, api_url, logo, description,
        country, language, category, trust_score, is_active, fetch_interval_minutes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      name.slice(0, 255),
      rss_url ? 'rss' : (api_url ? 'api' : 'rss'),
      feedUrl.slice(0, 2048),
      rss_url || null,
      api_url || null,
      logo || null,
      description || null,
      country.slice(0, 8),
      language.slice(0, 8),
      category.slice(0, 128),
      Math.min(100, Math.max(0, Number(trust_score) || 70)),
      is_active ? 1 : 0,
      Number(fetch_interval_minutes) || 15,
    ],
  );
  return result.insertId;
}

export async function updateSource(id, fields) {
  const allowed = [
    'name','rss_url','api_url','url','logo','description',
    'country','language','category','trust_score','is_active','fetch_interval_minutes',
  ];
  const sets = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    // Support 'enabled' as alias for 'is_active' from admin UI
    const col = k === 'enabled' ? 'is_active' : k;
    if (allowed.includes(col)) { sets.push(`\`${col}\` = ?`); vals.push(v ?? null); }
  }
  if (!sets.length) return 0;
  vals.push(id);
  const [r] = await pool.query(`UPDATE news_sources SET ${sets.join(', ')} WHERE id = ?`, vals);
  return r.affectedRows;
}

export async function deleteSource(id) {
  const [r] = await pool.query('DELETE FROM news_sources WHERE id = ?', [id]);
  return r.affectedRows;
}

export async function recordFetchSuccess(id, addedCount = 0) {
  await pool.query(
    `UPDATE news_sources
     SET last_fetched_at  = NOW(),
         last_success_at  = NOW(),
         last_error       = NULL,
         articles_imported = articles_imported + ?
     WHERE id = ?`,
    [addedCount, id],
  );
}

export async function recordFetchError(id, errorMessage) {
  await pool.query(
    `UPDATE news_sources
     SET last_fetched_at = NOW(),
         last_error      = ?
     WHERE id = ?`,
    [String(errorMessage).slice(0, 2000), id],
  );
}

/**
 * Seed or Sync curated sources from RSS_FEEDS_BY_CATEGORY into database.
 */
export async function syncCuratedSources(entries) {
  let inserted = 0;
  let updated = 0;
  for (const e of entries) {
    const feedUrl = (e.rss_url || e.url || '').trim();
    if (!feedUrl) continue;
    const name = (e.name || feedUrl).trim();
    const category = (e.category || 'General').trim();
    const trustScore = Math.min(100, Math.max(0, Number(e.trust_score) || 75));
    const country = (e.country || 'IN').slice(0, 8);
    const language = (e.language || 'en').slice(0, 8);

    try {
      // Check if source already exists by rss_url or url
      const [existing] = await pool.query(
        'SELECT id, name, category FROM news_sources WHERE rss_url = ? OR url = ? LIMIT 1',
        [feedUrl, feedUrl],
      );

      if (existing && existing.length > 0) {
        // Update category and name if they need refresh
        await pool.query(
          `UPDATE news_sources
           SET category = COALESCE(NULLIF(category, ''), ?),
               name = IF(name = '' OR name = url, ?, name),
               trust_score = GREATEST(trust_score, ?)
           WHERE id = ?`,
          [category, name, trustScore, existing[0].id],
        );
        updated++;
      } else {
        // Insert new source
        await pool.query(
          `INSERT INTO news_sources
             (name, source_type, url, rss_url, category, trust_score, is_active, country, language, fetch_interval_minutes)
           VALUES (?,?,?,?,?,?,1,?,?,15)`,
          [
            name.slice(0, 255),
            'rss',
            feedUrl.slice(0, 2048),
            feedUrl.slice(0, 2048),
            category.slice(0, 128),
            trustScore,
            country,
            language,
          ],
        );
        inserted++;
      }
    } catch (err) {
      console.warn(`[sourceModel.syncCuratedSources] Error syncing ${feedUrl}:`, err.message);
    }
  }
  return { total: entries.length, inserted, updated };
}

/**
 * Seed sources from hardcoded rss-feeds.js config when table is empty.
 */
export async function seedSources(entries) {
  const result = await syncCuratedSources(entries);
  return result.inserted;
}


import { pool } from '../db/pool.js';

const ORDER_SQL = `CASE trend_label
  WHEN 'Breakout' THEN 0
  WHEN 'Rising' THEN 1
  WHEN 'Realtime' THEN 2
  WHEN 'Daily' THEN 3
  WHEN 'Top' THEN 4
  ELSE 5
END`;

/**
 * Pre–timeframe migration: same rows served as the 30-day list only (24h/7d stay empty).
 */
async function listTrendsLegacy(geo, maxAgeHours, lim) {
  const [rows] = await pool.query(
    `SELECT geo, category_key, query_text, trend_label, value_score, seed_keyword, source, fetched_at
     FROM trends_topics
     WHERE geo = ? AND fetched_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
     ORDER BY ${ORDER_SQL}, value_score DESC, query_text ASC
     LIMIT ?`,
    [geo, maxAgeHours, lim],
  );
  return rows.map((r) => ({
    ...r,
    timeframe: '30d',
    why_context: null,
    traffic_note: null,
  }));
}

export async function replaceTrendsForGeo(geo, rows) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM trends_topics WHERE geo = ?', [geo]);
    const now = new Date();
    for (const r of rows) {
      await conn.query(
        `INSERT INTO trends_topics (geo, category_key, query_text, trend_label, value_score, seed_keyword, source, timeframe, why_context, traffic_note, fetched_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          geo,
          r.category_key,
          r.query_text.slice(0, 512),
          r.trend_label || null,
          r.value_score ?? null,
          r.seed_keyword ? r.seed_keyword.slice(0, 128) : null,
          r.source || 'related',
          (r.timeframe || '30d').slice(0, 8),
          r.why_context != null ? String(r.why_context).slice(0, 8000) : null,
          r.traffic_note != null ? String(r.traffic_note).slice(0, 64) : null,
          now,
        ],
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/**
 * @param {string} timeframe - '24h' | '7d' | '30d'
 */
export async function listTrendsByGeoTimeframe(geo, timeframe, maxAgeHours = 48, limit = 20) {
  const lim = Math.min(80, Math.max(1, limit));
  try {
    const [rows] = await pool.query(
      `SELECT geo, category_key, query_text, trend_label, value_score, seed_keyword, source, timeframe, why_context, traffic_note, fetched_at
       FROM trends_topics
       WHERE geo = ? AND timeframe = ? AND fetched_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
       ORDER BY ${ORDER_SQL}, value_score DESC, query_text ASC
       LIMIT ?`,
      [geo, timeframe, maxAgeHours, lim],
    );
    return rows;
  } catch (e) {
    if (e.code === 'ER_BAD_FIELD_ERROR' || e.errno === 1054) {
      console.warn(
        '[trends] DB missing timeframe/why columns. Run backend/sql/migration-trends-timeframe-why.sql; serving 30d list from legacy rows.',
      );
      if (timeframe === '30d') {
        try {
          return await listTrendsLegacy(geo, maxAgeHours, lim);
        } catch (e2) {
          if (e2.code === 'ER_NO_SUCH_TABLE' || e2.errno === 1146) return [];
          throw e2;
        }
      }
      return [];
    }
    if (e.code === 'ER_NO_SUCH_TABLE' || e.errno === 1146) return [];
    throw e;
  }
}

export async function getLatestTrendsFetchTime(geo) {
  try {
    const [rows] = await pool.query(
      `SELECT MAX(fetched_at) AS last_at FROM trends_topics WHERE geo = ?`,
      [geo],
    );
    return rows[0]?.last_at || null;
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE' || e.errno === 1146) return null;
    throw e;
  }
}

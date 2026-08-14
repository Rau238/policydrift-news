import { pool } from '../db/pool.js';

/**
 * Aggregate post_events into time-window counters for all active posts,
 * then bulk-upsert into post_metrics.
 *
 * Scope: only posts that have at least one event in the last 30 days
 * (prevents a full-table scan on post_metrics every run).
 */
export async function aggregateMetrics() {
  // ── 1. Views aggregation ──────────────────────────────────────────────────
  const [viewRows] = await pool.query(`
    SELECT
      post_id,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL  5 MINUTE) THEN 1 ELSE 0 END) AS v5m,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE) THEN 1 ELSE 0 END) AS v30m,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL  1 HOUR)   THEN 1 ELSE 0 END) AS v1h,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL  6 HOUR)   THEN 1 ELSE 0 END) AS v6h,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)   THEN 1 ELSE 0 END) AS v24h,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL  7 DAY)    THEN 1 ELSE 0 END) AS v7d,
      SUM(1)                                                                               AS v30d
    FROM post_events
    WHERE event_type = 'view'
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY post_id
  `);

  // ── 2. Engagement aggregation ─────────────────────────────────────────────
  const [engRows] = await pool.query(`
    SELECT
      post_id,
      SUM(CASE WHEN event_type = 'like'     AND created_at >= DATE_SUB(NOW(), INTERVAL  1 HOUR) THEN 1 ELSE 0 END) AS l1h,
      SUM(CASE WHEN event_type = 'like'     AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) AS l24h,
      SUM(CASE WHEN event_type = 'share'    AND created_at >= DATE_SUB(NOW(), INTERVAL  1 HOUR) THEN 1 ELSE 0 END) AS s1h,
      SUM(CASE WHEN event_type = 'share'    AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) AS s24h,
      SUM(CASE WHEN event_type = 'comment'  AND created_at >= DATE_SUB(NOW(), INTERVAL  1 HOUR) THEN 1 ELSE 0 END) AS c1h,
      SUM(CASE WHEN event_type = 'bookmark' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) AS bk24h
    FROM post_events
    WHERE event_type IN ('like','share','comment','bookmark')
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY post_id
  `);

  // ── 3. Merge into a map ───────────────────────────────────────────────────
  const engMap = new Map(engRows.map((r) => [r.post_id, r]));

  if (!viewRows.length && !engRows.length) return 0;

  const allPostIds = new Set([
    ...viewRows.map((r) => r.post_id),
    ...engRows.map((r) => r.post_id),
  ]);

  // ── 4. Bulk upsert ────────────────────────────────────────────────────────
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let count = 0;
    for (const postId of allPostIds) {
      const v = viewRows.find((r) => r.post_id === postId) || {};
      const e = engMap.get(postId) || {};
      await conn.query(
        `INSERT INTO post_metrics
           (post_id, views_5m, views_30m, views_1h, views_6h, views_24h, views_7d, views_30d,
            likes_1h, likes_24h, shares_1h, shares_24h, comments_1h, bookmarks_24h)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           views_5m       = VALUES(views_5m),
           views_30m      = VALUES(views_30m),
           views_1h       = VALUES(views_1h),
           views_6h       = VALUES(views_6h),
           views_24h      = VALUES(views_24h),
           views_7d       = VALUES(views_7d),
           views_30d      = VALUES(views_30d),
           likes_1h       = VALUES(likes_1h),
           likes_24h      = VALUES(likes_24h),
           shares_1h      = VALUES(shares_1h),
           shares_24h     = VALUES(shares_24h),
           comments_1h    = VALUES(comments_1h),
           bookmarks_24h  = VALUES(bookmarks_24h)`,
        [
          postId,
          v.v5m  ?? 0, v.v30m ?? 0, v.v1h  ?? 0, v.v6h ?? 0,
          v.v24h ?? 0, v.v7d  ?? 0, v.v30d ?? 0,
          e.l1h  ?? 0, e.l24h ?? 0, e.s1h  ?? 0, e.s24h ?? 0,
          e.c1h  ?? 0, e.bk24h ?? 0,
        ],
      );
      count++;
    }
    await conn.commit();
    return count;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Bulk-save computed ranking scores from the ranking worker.
 * `rows` = [{ postId, freshness, engagement, velocity, source, editorial, trending, top }]
 */
export async function saveRankingScores(rows) {
  if (!rows.length) return 0;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const r of rows) {
      await conn.query(
        `INSERT INTO post_metrics
           (post_id, freshness_score, engagement_score, velocity_score,
            source_score, editorial_score, trending_score, top_score)
         VALUES (?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           freshness_score  = VALUES(freshness_score),
           engagement_score = VALUES(engagement_score),
           velocity_score   = VALUES(velocity_score),
           source_score     = VALUES(source_score),
           editorial_score  = VALUES(editorial_score),
           trending_score   = VALUES(trending_score),
           top_score        = VALUES(top_score)`,
        [r.postId,
         clamp6(r.freshness), clamp6(r.engagement), clamp6(r.velocity),
         clamp6(r.source),    clamp6(r.editorial),
         clamp6(r.trending),  clamp6(r.top)],
      );
    }
    await conn.commit();
    return rows.length;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Load post_metrics rows for the ranking worker (posts published recently
 * that need score recalculation).
 */
export async function loadMetricsForRanking(windowDays = 7) {
  const [rows] = await pool.query(
    `SELECT
       p.id AS post_id,
       p.published_at,
       p.is_breaking,
       p.breaking_until,
       p.is_featured,
       p.featured_until,
       p.editorial_priority,
       p.source_id,
       COALESCE(ns.trust_score, 70)  AS trust_score,
       COALESCE(pm.views_5m,   0)    AS views_5m,
       COALESCE(pm.views_30m,  0)    AS views_30m,
       COALESCE(pm.views_1h,   0)    AS views_1h,
       COALESCE(pm.views_6h,   0)    AS views_6h,
       COALESCE(pm.views_24h,  0)    AS views_24h,
       COALESCE(pm.likes_1h,   0)    AS likes_1h,
       COALESCE(pm.likes_24h,  0)    AS likes_24h,
       COALESCE(pm.shares_1h,  0)    AS shares_1h,
       COALESCE(pm.shares_24h, 0)    AS shares_24h,
       COALESCE(pm.comments_1h,   0) AS comments_1h,
       COALESCE(pm.bookmarks_24h, 0) AS bookmarks_24h
     FROM posts p
     LEFT JOIN post_metrics  pm ON pm.post_id = p.id
     LEFT JOIN news_sources  ns ON ns.id       = p.source_id
     WHERE p.status       = 'published'
       AND p.published_at <= NOW()
       AND p.published_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [windowDays],
  );
  return rows;
}

// ─── helper ──────────────────────────────────────────────────────────────────
function clamp6(v) {
  const n = Number(v) || 0;
  return Math.min(999999, Math.max(0, Math.round(n * 1e6) / 1e6));
}

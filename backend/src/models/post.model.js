import { pool } from '../db/pool.js';

const listFields =
  'id, slug, title, excerpt, image_url, category, view_count, published_at, created_at, ' +
  'is_featured, is_breaking, like_count, share_count, reading_time_minutes, source_id';

export async function findByUrlHash(urlHash) {
  const [rows] = await pool.query('SELECT id FROM posts WHERE url_hash = ? LIMIT 1', [urlHash]);
  return rows[0] || null;
}

export async function findByContentHash(hash) {
  const [rows] = await pool.query('SELECT id FROM posts WHERE content_hash = ? LIMIT 1', [hash]);
  return rows[0] || null;
}

export async function findBySlug(slug) {
  const [rows] = await pool.query(`SELECT * FROM posts WHERE slug = ? LIMIT 1`, [slug]);
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.query(`SELECT * FROM posts WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function incrementViews(id) {
  await pool.query('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [id]);
}

// In-memory short TTL cache for count and category queries to avoid repeated heavy full scans
const countCache = new Map();
function getCachedCount(key) {
  const item = countCache.get(key);
  if (item && item.expires > Date.now()) return item.val;
  return null;
}
function setCachedCount(key, val, ttlMs = 45000) {
  countCache.set(key, { expires: Date.now() + ttlMs, val });
}

export async function listPosts({ category, search, page = 1, limit = 12 }) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "status = 'published'";
  if (category && category !== 'all') {
    where += ' AND category = ?';
    params.push(category);
  }
  if (search && String(search).trim()) {
    where += ' AND (title LIKE ? OR excerpt LIKE ?)';
    const q = `%${String(search).trim()}%`;
    params.push(q, q);
  }
  const [rows] = await pool.query(
    `SELECT ${listFields} FROM posts WHERE ${where} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const cacheKey = `cnt:${where}:${params.join(':')}`;
  let total = getCachedCount(cacheKey);
  if (total === null) {
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM posts WHERE ${where}`,
      params,
    );
    total = Number(countRows[0]?.total ?? 0);
    setCachedCount(cacheKey, total, 60000);
  }

  return {
    posts: rows,
    total,
    page,
    limit,
  };
}

let categoriesCache = null;
let categoriesCacheExpires = 0;

export async function listCategories() {
  const now = Date.now();
  if (categoriesCache && categoriesCacheExpires > now) {
    return categoriesCache;
  }
  const [rows] = await pool.query(
    `SELECT category, COUNT(*) AS count FROM posts WHERE status = 'published' GROUP BY category ORDER BY count DESC`,
  );
  categoriesCache = rows;
  categoriesCacheExpires = now + 60000;
  return rows;
}

/** Recent posts for matching Google Trends queries to headlines (syndicated titles). */
export async function listRecentForTrendMatching({ hours = 72, limit = 200 }) {
  const [rows] = await pool.query(
    `SELECT ${listFields} FROM posts
     WHERE status = 'published' AND published_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
     ORDER BY published_at DESC
     LIMIT ?`,
    [hours, limit],
  );
  return rows;
}

export async function listTrending({ limit = 6, days = 7 }) {
  const [rows] = await pool.query(
    `SELECT ${listFields} FROM posts 
     WHERE status = 'published' AND published_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY view_count DESC, published_at DESC
     LIMIT ?`,
    [days, limit],
  );
  return rows;
}

/** Latest — pure chronological, status-aware. */
export async function listLatest({ category = null, source = null, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const params = [];
  const conds = ["status = 'published'", 'published_at <= NOW()'];
  if (category && category !== 'all') { conds.push('category = ?'); params.push(category); }
  if (source) { conds.push('source_id = ?'); params.push(source); }
  const where = conds.join(' AND ');
  const [rows] = await pool.query(
    `SELECT ${listFields} FROM posts WHERE ${where} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const cacheKey = `cnt_latest:${where}:${params.join(':')}`;
  let total = getCachedCount(cacheKey);
  if (total === null) {
    const [ct] = await pool.query(`SELECT COUNT(*) AS total FROM posts WHERE ${where}`, params);
    total = Number(ct[0]?.total ?? 0);
    setCachedCount(cacheKey, total, 60000);
  }

  return { posts: rows, total, page, limit };
}

/** Top — balanced engagement + freshness + source + velocity + editorial (Optimized Subquery Join). */
export async function listTop({ limit = 10, days = 7 }) {
  const [rows] = await pool.query(
    `SELECT p.${listFields.replace(/,\s*/g, ', p.')},
            pm.top_score, pm.trending_score
     FROM (
       SELECT post_id, top_score, trending_score
       FROM post_metrics
       ORDER BY top_score DESC
       LIMIT 100
     ) pm
     JOIN posts p ON p.id = pm.post_id
     WHERE p.status = 'published'
       AND p.published_at <= NOW()
       AND p.published_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY pm.top_score DESC, p.published_at DESC
     LIMIT ?`,
    [days, limit],
  );
  return rows;
}

/** Trending — velocity-first ranking (Optimized Subquery Join). */
export async function listTrendingRanked({ limit = 10, days = 2 }) {
  const [rows] = await pool.query(
    `SELECT p.${listFields.replace(/,\s*/g, ', p.')},
            pm.trending_score, pm.velocity_score, pm.views_1h
     FROM (
       SELECT post_id, trending_score, velocity_score, views_1h
       FROM post_metrics
       ORDER BY trending_score DESC
       LIMIT 100
     ) pm
     JOIN posts p ON p.id = pm.post_id
     WHERE p.status = 'published'
       AND p.published_at <= NOW()
       AND p.published_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY pm.trending_score DESC, p.published_at DESC
     LIMIT ?`,
    [days, limit],
  );
  return rows;
}

/** Popular — raw engagement within a time window (Optimized Subquery Join). */
export async function listPopular({ limit = 10, period = 'day' }) {
  const col = ({ day: 'views_24h', week: 'views_7d', month: 'views_30d' })[period] || 'views_24h';
  const intervalMap = { day: '2 DAY', week: '10 DAY', month: '35 DAY' };
  const interval = intervalMap[period] || '2 DAY';
  const [rows] = await pool.query(
    `SELECT p.${listFields.replace(/,\s*/g, ', p.')},
            pm.\`${col}\` AS period_views
     FROM (
       SELECT post_id, \`${col}\`
       FROM post_metrics
       ORDER BY \`${col}\` DESC
       LIMIT 100
     ) pm
     JOIN posts p ON p.id = pm.post_id
     WHERE p.status = 'published'
       AND p.published_at <= NOW()
       AND p.published_at >= DATE_SUB(NOW(), INTERVAL ${interval})
     ORDER BY pm.\`${col}\` DESC, p.view_count DESC
     LIMIT ?`,
    [limit],
  );
  return rows;
}

/** Single post by slug — status-aware for public pages. */
export async function findPublishedBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT * FROM posts WHERE slug = ? AND status = 'published' AND published_at <= NOW() LIMIT 1`,
    [slug],
  );
  return rows[0] || null;
}

/** Update article fields (admin). */
export async function updatePost(id, fields) {
  const allowed = [
    'title','excerpt','body','image_url','category','status','is_featured','is_breaking',
    'breaking_until','featured_until','editorial_priority','author','tags','scheduled_at',
    'published_at','source_id',
  ];
  const sets = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    if (allowed.includes(k)) { sets.push(`\`${k}\` = ?`); vals.push(v ?? null); }
  }
  if (!sets.length) return 0;
  vals.push(id);
  const [r] = await pool.query(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`, vals);
  return r.affectedRows;
}

/** Bulk update article fields (admin). */
export async function bulkUpdatePosts(ids, fields) {
  if (!Array.isArray(ids) || !ids.length) return 0;
  const allowed = [
    'title', 'excerpt', 'body', 'image_url', 'category', 'status', 'is_featured', 'is_breaking',
    'breaking_until', 'featured_until', 'editorial_priority', 'author', 'tags', 'scheduled_at',
    'published_at', 'source_id',
  ];
  const sets = [];
  const vals = [];
  for (const [k, v] of Object.entries(fields)) {
    if (allowed.includes(k)) {
      sets.push(`\`${k}\` = ?`);
      vals.push(v ?? null);
    }
  }
  if (!sets.length) return 0;
  const [r] = await pool.query(
    `UPDATE posts SET ${sets.join(', ')} WHERE id IN (?)`,
    [...vals, ids],
  );
  return r.affectedRows;
}

/** Bulk delete articles (admin). */
export async function bulkDeletePosts(ids) {
  if (!Array.isArray(ids) || !ids.length) return 0;
  const cleanIds = ids.map((i) => parseInt(i, 10)).filter((n) => Number.isInteger(n) && n > 0);
  if (!cleanIds.length) return 0;
  await pool.query('DELETE FROM post_metrics WHERE post_id IN (?)', [cleanIds]);
  await pool.query('DELETE FROM post_events WHERE post_id IN (?)', [cleanIds]);
  const [r] = await pool.query('DELETE FROM posts WHERE id IN (?)', [cleanIds]);
  return r.affectedRows;
}

/** Publish all pending / review queue articles in one operation (admin). */
export async function publishAllPendingArticles({ category = null } = {}) {
  const conds = ["status = 'pending'"];
  const params = [];
  if (category && category !== 'all') {
    conds.push('category = ?');
    params.push(category);
  }
  const where = conds.join(' AND ');
  const [r] = await pool.query(
    `UPDATE posts SET status = 'published', published_at = NOW() WHERE ${where}`,
    params,
  );
  return r.affectedRows;
}

/** Admin list — all statuses, with metrics, search and sort. */
export async function adminListPosts({
  page = 1,
  limit = 20,
  status = null,
  category = null,
  search = null,
  is_featured = null,
  is_breaking = null,
  origin = null,
  sort = 'created_at_desc',
}) {
  const offset = (page - 1) * limit;
  const conds = [];
  const params = [];

  if (status && status !== 'all') {
    if (status === 'editorial' || status === 'our_stories') {
      conds.push('p.source_id IS NULL');
    } else {
      conds.push('p.status = ?');
      params.push(status);
    }
  }
  if (origin === 'editorial' || origin === 'our_stories') {
    conds.push('p.source_id IS NULL');
  } else if (origin === 'syndicated') {
    conds.push('p.source_id IS NOT NULL');
  }
  if (category && category !== 'all') {
    conds.push('p.category = ?');
    params.push(category);
  }
  if (is_featured !== null && is_featured !== undefined) {
    conds.push('p.is_featured = ?');
    params.push(is_featured ? 1 : 0);
  }
  if (is_breaking !== null && is_breaking !== undefined) {
    conds.push('p.is_breaking = ?');
    params.push(is_breaking ? 1 : 0);
  }
  if (search && search.trim()) {
    conds.push('(p.title LIKE ? OR p.slug LIKE ? OR p.excerpt LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

  let orderBy = 'p.created_at DESC';
  if (sort === 'published_at_desc') orderBy = 'p.published_at DESC';
  else if (sort === 'view_count_desc' || sort === 'views') orderBy = 'p.view_count DESC, p.created_at DESC';
  else if (sort === 'trending_score_desc' || sort === 'trending') orderBy = 'pm.trending_score DESC, p.created_at DESC';
  else if (sort === 'top_score_desc' || sort === 'top') orderBy = 'pm.top_score DESC, p.created_at DESC';
  else if (sort === 'oldest') orderBy = 'p.created_at ASC';

  const [rows] = await pool.query(
    `SELECT p.id, p.slug, p.title, p.excerpt, p.image_url, p.category, p.status, p.published_at, p.created_at,
            p.view_count, p.is_featured, p.is_breaking, p.editorial_priority, p.source_id,
            p.like_count, p.share_count, p.original_url,
            COALESCE(pm.trending_score,0) AS trending_score,
            COALESCE(pm.top_score,0) AS top_score,
            ns.name AS source_name
     FROM posts p
     LEFT JOIN post_metrics pm ON pm.post_id = p.id
     LEFT JOIN news_sources ns ON ns.id = p.source_id
     ${where}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  const [ct] = await pool.query(
    `SELECT COUNT(*) AS total FROM posts p ${where}`, params,
  );
  const total = ct[0]?.total ?? 0;
  return {
    posts: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/** Aggregate statistics for admin dashboard */
export async function getAdminStats() {
  const [statusRows] = await pool.query(
    `SELECT status, COUNT(*) AS count FROM posts GROUP BY status`,
  );
  const [featureRows] = await pool.query(
    `SELECT 
       SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) AS featured_count,
       SUM(CASE WHEN is_breaking = 1 THEN 1 ELSE 0 END) AS breaking_count,
       SUM(CASE WHEN source_id IS NULL THEN 1 ELSE 0 END) AS editorial_count,
       SUM(COALESCE(view_count, 0)) AS total_views,
       COUNT(*) AS total_posts
     FROM posts`,
  );
  const [todayRows] = await pool.query(
    `SELECT COUNT(*) AS today_posts FROM posts WHERE created_at >= CURDATE()`,
  );
  const [sourceRows] = await pool.query(
    `SELECT 
       COUNT(*) AS total_sources,
       SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_sources,
       SUM(COALESCE(articles_imported, 0)) AS total_imported
     FROM news_sources`,
  );
  const [categoryRows] = await pool.query(
    `SELECT category, COUNT(*) AS count, SUM(COALESCE(view_count, 0)) AS views 
     FROM posts 
     WHERE status = 'published'
     GROUP BY category 
     ORDER BY count DESC 
     LIMIT 10`,
  );
  const [recentPublishTrend] = await pool.query(
    `SELECT DATE(created_at) AS post_date, COUNT(*) AS count, SUM(COALESCE(view_count, 0)) AS views
     FROM posts
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
     GROUP BY DATE(created_at)
     ORDER BY post_date ASC`,
  );
  const [topSourceVolume] = await pool.query(
    `SELECT ns.name, COUNT(p.id) AS count, ns.category, ns.is_active
     FROM news_sources ns
     LEFT JOIN posts p ON p.source_id = ns.id
     GROUP BY ns.id, ns.name, ns.category, ns.is_active
     ORDER BY count DESC
     LIMIT 8`,
  );
  const [topArticles] = await pool.query(
    `SELECT id, title, slug, category, view_count, created_at, published_at, is_featured, is_breaking
     FROM posts
     WHERE status = 'published'
     ORDER BY view_count DESC, created_at DESC
     LIMIT 5`,
  );

  const statusMap = {};
  for (const r of statusRows) {
    statusMap[r.status] = r.count;
  }

  const f = featureRows[0] || {};
  const s = sourceRows[0] || {};
  const t = todayRows[0] || {};

  return {
    total: Number(f.total_posts) || 0,
    published: Number(statusMap['published']) || 0,
    pending: Number(statusMap['pending']) || 0,
    draft: Number(statusMap['draft']) || 0,
    archived: Number(statusMap['archived']) || 0,
    editorial: Number(f.editorial_count) || 0,
    rejected: Number(statusMap['rejected']) || 0,
    featured: Number(f.featured_count) || 0,
    breaking: Number(f.breaking_count) || 0,
    totalViews: Number(f.total_views) || 0,
    todayPosts: Number(t.today_posts) || 0,
    totalSources: Number(s.total_sources) || 0,
    activeSources: Number(s.active_sources) || 0,
    totalImported: Number(s.total_imported) || 0,
    categoryDistribution: categoryRows.map((r) => ({
      category: r.category || 'General',
      count: Number(r.count) || 0,
      views: Number(r.views) || 0,
    })),
    publishingTrend: recentPublishTrend.map((r) => ({
      date: r.post_date instanceof Date ? r.post_date.toISOString().slice(0, 10) : String(r.post_date).slice(0, 10),
      count: Number(r.count) || 0,
      views: Number(r.views) || 0,
    })),
    topSources: topSourceVolume.map((r) => ({
      name: r.name,
      count: Number(r.count) || 0,
      category: r.category,
      isActive: Boolean(r.is_active),
    })),
    topArticles: topArticles.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category,
      views: Number(r.view_count) || 0,
      publishedAt: r.published_at,
      isFeatured: Boolean(r.is_featured),
      isBreaking: Boolean(r.is_breaking),
    })),
  };
}

export async function createPost(row) {
  const {
    slug,
    title,
    excerpt,
    key_takeaways,
    body,
    original_url,
    url_hash,
    content_hash = null,
    image_url,
    category,
    published_at,
    source_feed,
    source_id = null,
    status = 'published',
    auto_published = 0,
    reading_time_minutes = 0,
    author = null,
    tags = null,
    is_featured = 0,
    is_breaking = 0,
    breaking_until = null,
    featured_until = null,
    editorial_priority = 'normal',
    scheduled_at = null,
  } = row;

  // Ensure tags are stored as valid JSON string or null
  const formattedTags = tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : null;

  const [result] = await pool.query(
    `INSERT INTO posts
       (slug, title, excerpt, key_takeaways, body, original_url, url_hash, content_hash,
        image_url, category, published_at, source_feed, source_id, status, auto_published, reading_time_minutes,
        author, tags, is_featured, is_breaking, breaking_until, featured_until, editorial_priority, scheduled_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      title,
      excerpt ?? null,
      key_takeaways ?? null,
      body ?? '',
      original_url || '',
      url_hash,
      content_hash ?? null,
      image_url || null,
      category || 'General',
      published_at || new Date(),
      source_feed || null,
      source_id ?? null,
      status || 'published',
      auto_published ? 1 : 0,
      reading_time_minutes ?? 0,
      author || null,
      formattedTags,
      is_featured ? 1 : 0,
      is_breaking ? 1 : 0,
      breaking_until || null,
      featured_until || null,
      editorial_priority || 'normal',
      scheduled_at || null,
    ],
  );

  const insertId = result.insertId;

  // Initialize corresponding metrics record so ranking and feeds pick it up immediately
  try {
    await pool.query(
      `INSERT INTO post_metrics (post_id, top_score, trending_score, freshness_score, updated_at)
       VALUES (?, 0.5, 0.5, 1.0, NOW())
       ON DUPLICATE KEY UPDATE freshness_score = 1.0`,
      [insertId],
    );
  } catch (err) {
    console.warn('[postModel] Failed to init metrics for post', insertId, err.message);
  }

  // Invalidate in-memory caches
  countCache.clear();
  categoriesCache = null;

  return insertId;
}

export async function slugExists(slug) {
  const [rows] = await pool.query('SELECT id FROM posts WHERE slug = ? LIMIT 1', [slug]);
  return !!rows[0];
}

/** Get total count of currently published canonical articles */
export async function getPublishedPostsCount() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM posts WHERE status = 'published' AND published_at <= NOW()`,
  );
  return Number(rows[0]?.total) || 0;
}

/** Get the latest modification timestamp across all published articles */
export async function getLatestPublishedModTime() {
  const [rows] = await pool.query(
    `SELECT COALESCE(MAX(updated_at), MAX(published_at), NOW()) AS lastmod
     FROM posts
     WHERE status = 'published' AND published_at <= NOW()`,
  );
  return rows[0]?.lastmod || new Date();
}

/**
 * Retrieve a chunk of published articles for sitemap generation.
 * Uses index-optimized range scanning that scales to 1,000,000+ articles.
 *
 * @param {{ chunk?: number, limit?: number }} options
 */
export async function listPublishedPostsChunk({ chunk = 1, limit = 50000 } = {}) {
  const cleanLimit = Math.min(50000, Math.max(1, parseInt(limit, 10) || 50000));
  const cleanChunk = Math.max(1, parseInt(chunk, 10) || 1);
  const offset = (cleanChunk - 1) * cleanLimit;

  if (offset === 0) {
    const [rows] = await pool.query(
      `SELECT id, slug, published_at, updated_at
       FROM posts
       WHERE status = 'published' AND published_at <= NOW()
       ORDER BY id ASC
       LIMIT ?`,
      [cleanLimit],
    );
    return rows;
  }

  // Find start ID using covering index
  const [idRows] = await pool.query(
    `SELECT id FROM posts
     WHERE status = 'published' AND published_at <= NOW()
     ORDER BY id ASC
     LIMIT 1 OFFSET ?`,
    [offset],
  );

  if (!idRows.length) return [];
  const startId = idRows[0].id;

  const [rows] = await pool.query(
    `SELECT id, slug, published_at, updated_at
     FROM posts
     WHERE status = 'published' AND published_at <= NOW() AND id >= ?
     ORDER BY id ASC
     LIMIT ?`,
    [startId, cleanLimit],
  );
  return rows;
}

/** Legacy sitemap list - status aware (capped at 50,000 for safety) */
export async function listSlugsForSitemap() {
  const [rows] = await pool.query(
    `SELECT slug, COALESCE(updated_at, published_at) AS lastmod
     FROM posts
     WHERE status = 'published' AND published_at <= NOW()
     ORDER BY published_at DESC
     LIMIT 50000`,
  );
  return rows;
}

/**
 * 10-day retention cleanup: Prunes automated scraped RSS articles older than retentionDays in non-blocking batches.
 * CRITICAL RULE: User/Admin-authored stories (source_id IS NULL or editorial_priority = 'pinned' or is_featured = 1)
 * are PERMANENTLY EXEMPT and NEVER deleted on any time period.
 */
export async function pruneOldArticles(retentionDays = 10) {
  const days = Math.max(1, parseInt(retentionDays, 10) || 10);
  // Strictly target automated scraped RSS feeds (source_id IS NOT NULL), never touching authored/editorial stories
  const [countRes] = await pool.query(
    `SELECT COUNT(*) AS count FROM posts 
     WHERE published_at < DATE_SUB(NOW(), INTERVAL ? DAY)
       AND source_id IS NOT NULL
       AND is_featured = 0
       AND (editorial_priority IS NULL OR editorial_priority != 'pinned')`,
    [days]
  );
  const totalOld = countRes[0]?.count || 0;
  if (totalOld === 0) {
    return { deletedPosts: 0, deletedMetrics: 0, deletedEvents: 0 };
  }

  let totalDeleted = 0;
  const batchSize = 2000;

  while (true) {
    const [idRows] = await pool.query(
      `SELECT id FROM posts 
       WHERE published_at < DATE_SUB(NOW(), INTERVAL ? DAY)
         AND source_id IS NOT NULL
         AND is_featured = 0
         AND (editorial_priority IS NULL OR editorial_priority != 'pinned')
       LIMIT ?`,
      [days, batchSize]
    );
    if (!idRows.length) break;
    const ids = idRows.map((r) => r.id);

    await pool.query(`DELETE FROM post_metrics WHERE post_id IN (?)`, [ids]);
    await pool.query(`DELETE FROM post_events WHERE post_id IN (?)`, [ids]);
    const [delRes] = await pool.query(`DELETE FROM posts WHERE id IN (?)`, [ids]);

    totalDeleted += delRes.affectedRows || ids.length;
    await new Promise((r) => setTimeout(r, 40));
  }

  const [metricCleanup] = await pool.query(`
    DELETE pm FROM post_metrics pm
    LEFT JOIN posts p ON pm.post_id = p.id
    WHERE p.id IS NULL
  `);

  const [eventCleanup] = await pool.query(`
    DELETE pe FROM post_events pe
    LEFT JOIN posts p ON pe.post_id = p.id
    WHERE p.id IS NULL
  `);

  // Clear memory count caches
  countCache.clear();
  categoriesCache = null;

  return {
    deletedPosts: totalDeleted,
    deletedMetrics: metricCleanup.affectedRows || 0,
    deletedEvents: eventCleanup.affectedRows || 0,
  };
}


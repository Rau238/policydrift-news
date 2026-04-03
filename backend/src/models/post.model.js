import { pool } from '../db/pool.js';

const listFields =
  'id, slug, title, excerpt, image_url, category, view_count, published_at, created_at';

export async function findByUrlHash(urlHash) {
  const [rows] = await pool.query('SELECT id FROM posts WHERE url_hash = ? LIMIT 1', [urlHash]);
  return rows[0] || null;
}

export async function findBySlug(slug) {
  const [rows] = await pool.query(`SELECT * FROM posts WHERE slug = ? LIMIT 1`, [slug]);
  return rows[0] || null;
}

export async function incrementViews(id) {
  await pool.query('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [id]);
}

export async function listPosts({ category, page = 1, limit = 12 }) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = '1=1';
  if (category && category !== 'all') {
    where += ' AND category = ?';
    params.push(category);
  }
  const [rows] = await pool.query(
    `SELECT ${listFields} FROM posts WHERE ${where} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM posts WHERE ${where}`,
    params,
  );
  return {
    posts: rows,
    total: countRows[0]?.total ?? 0,
    page,
    limit,
  };
}

export async function listCategories() {
  const [rows] = await pool.query(
    `SELECT category, COUNT(*) AS count FROM posts GROUP BY category ORDER BY count DESC`,
  );
  return rows;
}

/** Recent posts for matching Google Trends queries to headlines (syndicated titles). */
export async function listRecentForTrendMatching({ hours = 72, limit = 200 }) {
  const [rows] = await pool.query(
    `SELECT ${listFields} FROM posts
     WHERE published_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
     ORDER BY published_at DESC
     LIMIT ?`,
    [hours, limit],
  );
  return rows;
}

export async function listTrending({ limit = 6, days = 7 }) {
  const [rows] = await pool.query(
    `SELECT ${listFields} FROM posts 
     WHERE published_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     ORDER BY view_count DESC, published_at DESC
     LIMIT ?`,
    [days, limit],
  );
  return rows;
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
    image_url,
    category,
    published_at,
    source_feed,
  } = row;
  const [result] = await pool.query(
    `INSERT INTO posts (slug, title, excerpt, key_takeaways, body, original_url, url_hash, image_url, category, published_at, source_feed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      title,
      excerpt,
      key_takeaways ?? null,
      body,
      original_url,
      url_hash,
      image_url || null,
      category,
      published_at,
      source_feed || null,
    ],
  );
  return result.insertId;
}

export async function slugExists(slug) {
  const [rows] = await pool.query('SELECT id FROM posts WHERE slug = ? LIMIT 1', [slug]);
  return !!rows[0];
}

export async function listSlugsForSitemap() {
  const [rows] = await pool.query(
    'SELECT slug, updated_at AS lastmod FROM posts ORDER BY published_at DESC',
  );
  return rows;
}

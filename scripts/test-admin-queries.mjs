import mysql from 'mysql2/promise';

async function benchmark() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'policydrift_news',
    port: 3306,
  });

  const queries = [
    { name: 'status', sql: "SELECT status, COUNT(*) AS count FROM posts GROUP BY status" },
    { name: 'features', sql: "SELECT SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) AS featured_count, SUM(CASE WHEN is_breaking = 1 THEN 1 ELSE 0 END) AS breaking_count FROM posts WHERE is_featured = 1 OR is_breaking = 1" },
    { name: 'editorial', sql: "SELECT COUNT(*) AS editorial_count FROM posts WHERE source_id IS NULL" },
    { name: 'visual', sql: "SELECT COUNT(*) AS visual_stories_count FROM posts WHERE is_featured = 1 OR editorial_priority = 'pinned'" },
    { name: 'today', sql: "SELECT COUNT(*) AS today_posts FROM posts WHERE created_at >= CURDATE()" },
    { name: 'categories', sql: "SELECT category, COUNT(*) AS count, SUM(COALESCE(view_count, 0)) AS views FROM posts WHERE status = 'published' GROUP BY category ORDER BY count DESC LIMIT 10" },
    { name: 'trend', sql: "SELECT DATE(created_at) AS post_date, COUNT(*) AS count, SUM(COALESCE(view_count, 0)) AS views FROM posts WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) GROUP BY DATE(created_at) ORDER BY post_date ASC" },
    { name: 'topSources', sql: "SELECT ns.name, COUNT(p.id) AS count, ns.category, ns.is_active FROM news_sources ns LEFT JOIN posts p ON p.source_id = ns.id GROUP BY ns.id, ns.name, ns.category, ns.is_active ORDER BY count DESC LIMIT 8" },
    { name: 'topArticles', sql: "SELECT id, title, slug, category, view_count, created_at, published_at, is_featured, is_breaking FROM posts WHERE status = 'published' ORDER BY view_count DESC LIMIT 5" }
  ];

  for (const q of queries) {
    const t0 = Date.now();
    try {
      const [r] = await pool.query(q.sql);
      console.log(q.name, 'took', Date.now() - t0, 'ms. Rows:', r.length);
    } catch (e) {
      console.log(q.name, 'ERROR:', e.message);
    }
  }

  await pool.end();
}

benchmark();

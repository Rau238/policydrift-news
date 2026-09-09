/**
 * NewsFree365 — Database Paywall & Ad Contamination Cleaner
 *
 * Cleans out any paywall barrier content, subscription advertisements,
 * and barrier images accidentally extracted from hard-paywall sites.
 */

import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

async function main() {
  console.log('[CLEANUP] Connecting to MySQL database...');
  const pool = mysql.createPool({
    host: env.MYSQL_HOST || '127.0.0.1',
    port: env.MYSQL_PORT || 3306,
    user: env.MYSQL_USER || 'root',
    password: env.MYSQL_PASSWORD || 'root',
    database: env.MYSQL_DATABASE || 'policydrift_news',
    waitForConnections: true,
    connectionLimit: 5,
  });

  const [posts] = await pool.query(`
    SELECT id, title, slug, excerpt, body, image_url
    FROM posts
    WHERE body LIKE '%Subscribe to unlock%'
       OR body LIKE '%Try unlimited access%'
       OR body LIKE '%barrier-page%'
       OR body LIKE '%Standard Digital%'
       OR body LIKE '%Premium Digital%'
       OR image_url LIKE '%barrier%'
       OR image_url LIKE '%next-barrier-page%'
  `);

  console.log(`[CLEANUP] Found ${posts.length} contaminated posts to clean.`);

  let cleaned = 0;
  const FALLBACK_IMG = 'https://www.newsfree365.live/images/story-fallback.svg';

  for (const post of posts) {
    let newBody = post.excerpt ? `<p>${post.excerpt.replace(/<[^>]+>/g, '')}</p>` : '';
    let newImageUrl = post.image_url;

    if (
      newImageUrl &&
      (newImageUrl.includes('barrier') ||
       newImageUrl.includes('paywall') ||
       newImageUrl.includes('next-barrier-page'))
    ) {
      newImageUrl = FALLBACK_IMG;
    }

    await pool.query(
      `UPDATE posts
       SET body = ?,
           image_url = ?,
           extraction_status = 'rss_only',
           content_available = 0
       WHERE id = ?`,
      [newBody, newImageUrl, post.id]
    );

    cleaned++;
  }

  console.log(`[CLEANUP] Successfully cleaned and repaired ${cleaned} posts.`);
  await pool.end();
}

main().catch((err) => {
  console.error('[CLEANUP] Error during cleanup:', err);
  process.exit(1);
});

/**
 * PolicyDrift — Scheduler Service
 *
 * Handles two time-sensitive tasks:
 *   1. Publish articles whose `scheduled_at` has arrived.
 *   2. Expire breaking-news flags whose `breaking_until` has passed.
 */

import { pool } from '../db/pool.js';

/**
 * Publish any articles that are in `pending` or `draft` status and whose
 * `scheduled_at` <= NOW().
 * @returns {{ published: number }}
 */
export async function publishScheduledArticles() {
  const [result] = await pool.query(
    `UPDATE posts
     SET    status       = 'published',
            published_at = COALESCE(published_at, scheduled_at, NOW())
     WHERE  status       IN ('pending', 'draft')
       AND  scheduled_at IS NOT NULL
       AND  scheduled_at <= NOW()`,
  );
  return { published: result.affectedRows };
}

/**
 * Remove the breaking-news flag from articles whose `breaking_until` has
 * passed.  The article remains published; it just stops getting the editorial
 * boost.
 * @returns {{ expired: number }}
 */
export async function expireBreakingNews() {
  const [result] = await pool.query(
    `UPDATE posts
     SET    is_breaking   = 0,
            breaking_until = NULL
     WHERE  is_breaking   = 1
       AND  breaking_until IS NOT NULL
       AND  breaking_until <= NOW()`,
  );
  return { expired: result.affectedRows };
}

/**
 * Remove expired featured flags.
 * @returns {{ expired: number }}
 */
export async function expireFeaturedArticles() {
  const [result] = await pool.query(
    `UPDATE posts
     SET    is_featured   = 0,
            featured_until = NULL
     WHERE  is_featured   = 1
       AND  featured_until IS NOT NULL
       AND  featured_until <= NOW()`,
  );
  return { expired: result.affectedRows };
}

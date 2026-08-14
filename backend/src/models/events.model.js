import { pool } from '../db/pool.js';
import { RANKING } from '../config/ranking.js';

/**
 * Check if a view event from this fingerprint (ip_hash or session_id) already
 * exists for this post within the dedup window.
 */
export async function hasRecentViewEvent(postId, ipHash, windowMinutes) {
  const mins = windowMinutes ?? RANKING.viewDedupMinutes;
  const [rows] = await pool.query(
    `SELECT id FROM post_events
     WHERE post_id    = ?
       AND event_type = 'view'
       AND ip_hash    = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
     LIMIT 1`,
    [postId, ipHash, mins],
  );
  return !!rows[0];
}

/**
 * Record any post interaction event.
 * Returns the new event id, or null if skipped (view dedup).
 *
 * @param {object} opts
 * @param {number}      opts.postId
 * @param {'view'|'like'|'share'|'bookmark'|'comment'|'click'} opts.eventType
 * @param {string|null} opts.ipHash   - SHA-256 of request IP
 * @param {string|null} opts.sessionId
 * @param {number|null} opts.userId
 * @param {object|null} opts.metadata
 */
export async function recordEvent({ postId, eventType, ipHash = null, sessionId = null, userId = null, metadata = null }) {
  // View deduplication: skip if same ip already viewed this post recently
  if (eventType === 'view' && ipHash) {
    const dup = await hasRecentViewEvent(postId, ipHash, RANKING.viewDedupMinutes);
    if (dup) return null;
  }

  const [result] = await pool.query(
    `INSERT INTO post_events (post_id, event_type, user_id, session_id, ip_hash, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [postId, eventType, userId ?? null, sessionId ?? null, ipHash ?? null,
     metadata ? JSON.stringify(metadata) : null],
  );
  return result.insertId;
}

/**
 * Delete events older than retentionDays (called by cleanup worker).
 */
export async function pruneOldEvents(retentionDays) {
  const days = retentionDays ?? RANKING.eventRetentionDays;
  const [result] = await pool.query(
    `DELETE FROM post_events WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [days],
  );
  return result.affectedRows;
}

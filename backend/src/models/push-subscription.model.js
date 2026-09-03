import { pool } from '../db/pool.js';

let tableEnsured = false;

export async function ensurePushTableExists() {
  if (tableEnsured) return;
  const sql = `
    CREATE TABLE IF NOT EXISTS news_push_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      endpoint VARCHAR(768) NOT NULL,
      p256dh VARCHAR(255) NOT NULL,
      auth VARCHAR(255) NOT NULL,
      user_agent VARCHAR(512) NULL,
      ip_address VARCHAR(64) NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_endpoint (endpoint(255)),
      INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  try {
    await pool.query(sql);
    tableEnsured = true;
  } catch (err) {
    console.warn('[push-subscription.model] Table initialization notice:', err.message);
  }
}

/**
 * Save or update a native browser push subscription.
 */
export async function saveSubscription({ endpoint, p256dh, auth, userAgent = null, ip = null }) {
  await ensurePushTableExists();
  const sql = `
    INSERT INTO news_push_subscriptions
      (endpoint, p256dh, auth, user_agent, ip_address, is_active, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, NOW())
    ON DUPLICATE KEY UPDATE
      p256dh = VALUES(p256dh),
      auth = VALUES(auth),
      user_agent = COALESCE(VALUES(user_agent), user_agent),
      ip_address = COALESCE(VALUES(ip_address), ip_address),
      is_active = 1,
      updated_at = NOW();
  `;
  const [result] = await pool.query(sql, [
    endpoint,
    p256dh,
    auth,
    userAgent ? String(userAgent).slice(0, 512) : null,
    ip ? String(ip).slice(0, 64) : null,
  ]);
  return { id: result.insertId || null, endpoint };
}

/**
 * Deactivate an unsubscribed or expired subscription.
 */
export async function deactivateSubscription(endpoint) {
  await ensurePushTableExists();
  const sql = `UPDATE news_push_subscriptions SET is_active = 0, updated_at = NOW() WHERE endpoint = ?`;
  const [result] = await pool.query(sql, [endpoint]);
  return result.affectedRows > 0;
}

/**
 * Get all active subscriptions for broadcasting.
 */
export async function getActiveSubscriptions() {
  await ensurePushTableExists();
  const [rows] = await pool.query(
    `SELECT id, endpoint, p256dh, auth FROM news_push_subscriptions WHERE is_active = 1 ORDER BY id DESC`
  );
  return rows;
}

/**
 * Count total active subscribers in database.
 */
export async function countActiveSubscriptions() {
  await ensurePushTableExists();
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM news_push_subscriptions WHERE is_active = 1`
  );
  return rows[0]?.count ?? 0;
}

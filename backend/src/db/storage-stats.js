import { env } from '../config/env.js';
import { pool } from './pool.js';

/**
 * Log MySQL storage for this app DB + (if permitted) all non-system DBs on the server.
 * Runs once per process start when MYSQL_LOG_STORAGE_ON_START is not "false".
 */
export async function logMysqlStorageOnStartup() {
  if (!env.MYSQL_LOG_STORAGE_ON_START) return;

  const dbName = env.MYSQL_DATABASE;

  try {
    const [dbRows] = await pool.execute(
      `SELECT
        ROUND(COALESCE(SUM(data_length + index_length), 0) / 1024 / 1024, 3) AS used_mb,
        ROUND(COALESCE(SUM(data_free), 0) / 1024 / 1024, 3) AS data_free_mb,
        COUNT(*) AS table_count
       FROM information_schema.tables
       WHERE table_schema = ?`,
      [dbName],
    );
    const row = dbRows[0] || {};
    const used = Number(row.used_mb) || 0;
    const freeFrag = Number(row.data_free_mb) || 0;
    const tables = Number(row.table_count) || 0;

    let postsLine = '';
    try {
      const [cnt] = await pool.execute('SELECT COUNT(*) AS n FROM posts');
      postsLine = ` | posts rows: ${cnt[0]?.n ?? '?'}`;
    } catch {
      postsLine = '';
    }

    let serverLine = '';
    try {
      const [allRows] = await pool.execute(
        `SELECT ROUND(COALESCE(SUM(data_length + index_length), 0) / 1024 / 1024, 3) AS total_mb
         FROM information_schema.tables
         WHERE table_schema NOT IN ('information_schema','mysql','performance_schema','sys')`,
      );
      const total = Number(allRows[0]?.total_mb) || 0;
      serverLine = ` | server (all user DBs): ${total} MB used`;
    } catch {
      // User may lack global information_schema rights on managed hosts
    }

    console.log(
      `[MySQL storage] DB "${dbName}": ${used} MB used (data+indexes), ${freeFrag} MB reported free/fragment, ${tables} table(s)${postsLine}${serverLine}`,
    );
  } catch (e) {
    console.warn('[MySQL storage] Could not read information_schema:', e.message);
  }
}

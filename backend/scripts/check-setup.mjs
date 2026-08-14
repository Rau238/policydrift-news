/**
 * Verifies MySQL connectivity and that `posts` exists.
 * Run from repo root: npm run check
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const nodeEnv = process.env.NODE_ENV || 'development';

dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, `.env.${nodeEnv}`), override: true });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const cfg = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE || 'policydrift',
};

console.log('\nPolicyDrift — setup check\n');
console.log(`  NODE_ENV: ${nodeEnv}`);
console.log(`  MySQL target: ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}`);
console.log(`  RSS_FEED_URLS: ${process.env.RSS_FEED_URLS ? 'set' : '(empty — ingest will no-op)'}`);
console.log(
  `  NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || '(not set — use .env.development / .env.production)'}\n`,
);

try {
  const c = await mysql.createConnection(cfg);
  await c.ping();
  const [rows] = await c.query('SELECT COUNT(*) AS n FROM posts');
  await c.end();
  console.log('  ✓ MySQL: connected');
  console.log(`  ✓ Table posts: OK (${rows[0].n} rows)\n`);
  const apiPort = process.env.API_PORT || process.env.PORT || '4000';
  const webPort = process.env.WEB_PORT || '3000';
  console.log('Next steps:');
  console.log(`  1. npm run dev          (API :${apiPort} + web :${webPort}, .env.development)`);
  console.log(`  2. npm run build:prod   (Next production build with .env.production)`);
  console.log(`  3. POST http://127.0.0.1:${apiPort}/api/posts/ingest`);
  console.log(`  4. Open http://localhost:${webPort}\n`);
} catch (e) {
  console.error('  ✗ MySQL:', e.message);
  if (e.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('\n  → Wrong MYSQL_USER / MYSQL_PASSWORD in .env.development / .env.production\n');
  } else if (e.code === 'ER_BAD_DB_ERROR' || /Unknown database/i.test(e.message)) {
    console.error(`\n  → Create the database (see SETUP.md) and run: backend/sql/schema.sql\n`);
  } else if (e.code === 'ECONNREFUSED') {
    console.error('\n  → MySQL is not running or MYSQL_HOST/MYSQL_PORT is wrong.\n');
  } else if (e.code === 'ER_NO_SUCH_TABLE') {
    console.error('\n  → Database exists but `posts` is missing. Run backend/sql/schema.sql\n');
  }
  process.exit(1);
}

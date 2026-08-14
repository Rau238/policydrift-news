import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env.production') });

const c = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'policydrift_news',
});

const [cols] = await c.query("SHOW COLUMNS FROM posts LIKE 'key_takeaways'");
if (!cols.length) {
  await c.query('ALTER TABLE posts ADD COLUMN key_takeaways TEXT NULL AFTER excerpt');
  console.log('added key_takeaways');
} else {
  console.log('key_takeaways ok');
}
const [n] = await c.query('SELECT COUNT(*) AS n FROM posts');
console.log('posts', n[0].n);
await c.end();

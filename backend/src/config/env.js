import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

function required(name, fallback = null) {
  const v = process.env[name];
  if (v === undefined || v === '') {
    if (fallback !== null) return fallback;
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.API_PORT || process.env.PORT || '4000', 10),
  MYSQL_HOST: required('MYSQL_HOST', '127.0.0.1'),
  MYSQL_PORT: parseInt(process.env.MYSQL_PORT || '3306', 10),
  MYSQL_USER: required('MYSQL_USER', 'root'),
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',
  MYSQL_DATABASE: required('MYSQL_DATABASE', 'policydrift'),
  MYSQL_POOL_LIMIT: parseInt(process.env.MYSQL_POOL_LIMIT || '10', 10),
  MYSQL_LOG_STORAGE_ON_START: process.env.MYSQL_LOG_STORAGE_ON_START !== 'false',
  RSS_FEED_URLS: (process.env.RSS_FEED_URLS || '').split(',').map((s) => s.trim()).filter(Boolean),
  RSS_MAX_ITEMS: parseInt(process.env.RSS_MAX_ITEMS || '0', 10),
  RSS_FETCH_OG_IMAGE: process.env.RSS_FETCH_OG_IMAGE !== 'false',
  RSS_IMAGE_OG_TIMEOUT_MS: parseInt(process.env.RSS_IMAGE_OG_TIMEOUT_MS || '3200', 10),
  RSS_IMAGE_OG_CONCURRENCY: parseInt(process.env.RSS_IMAGE_OG_CONCURRENCY || '6', 10),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  CRON_ENABLED: process.env.CRON_ENABLED !== 'false',
  RSS_CRON_INTERVAL_MINUTES: Math.min(59,Math.max(1, parseInt(process.env.RSS_CRON_INTERVAL_MINUTES || '5', 10) || 5),),
  CORS_ORIGIN:process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000',
  SITE_PUBLIC_URL: (process.env.SITE_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || '').trim(),
   INDEXNOW_KEY: (process.env.INDEXNOW_KEY || '').trim(),
  STORY_FALLBACK_IMAGE_URL: (process.env.STORY_FALLBACK_IMAGE_URL || '').trim(),
  TRENDS_ENABLED: process.env.TRENDS_ENABLED === 'true',
  TRENDS_GEO: (process.env.TRENDS_GEO || 'IN').trim().slice(0, 8) || 'IN',
  TRENDS_REQUEST_DELAY_MS: parseInt(process.env.TRENDS_REQUEST_DELAY_MS || '3500', 10) || 3500,
  TRENDS_CACHE_MAX_AGE_HOURS: parseInt(process.env.TRENDS_CACHE_MAX_AGE_HOURS || '48', 10) || 48,
  TRENDS_MATCH_POST_HOURS: parseInt(process.env.TRENDS_MATCH_POST_HOURS || '72', 10) || 72,
  TRENDS_MATCH_POST_LIMIT: parseInt(process.env.TRENDS_MATCH_POST_LIMIT || '200', 10) || 200,
  TRENDS_REFRESH_SECRET: (process.env.TRENDS_REFRESH_SECRET || '').trim(),
  TRENDS_CRON: (process.env.TRENDS_CRON || '*/10 * * * *').trim(),
};

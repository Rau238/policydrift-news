import { env } from '../config/env.js';
import { getTrendsWithMatches, refreshTrendsCache } from '../services/google-trends.service.js';

const EMPTY_HINT =
  'Cache is empty. From the repo root run: npm run trends, and ensure MySQL has table trends_topics with timeframe columns (backend/sql/migration-trends-timeframe-why.sql if upgrading). If rows still never appear, Google may be rate-limiting; wait and retry.';

function clampLimit(v, def, max = 30) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.min(max, Math.max(4, n));
}

export async function getTrendsBundle(req, res) {
  try {
    const geo = (req.query.geo || env.TRENDS_GEO || 'IN').toString().trim().slice(0, 8);
    const single = req.query.limit ? clampLimit(req.query.limit, 18) : null;
    const h24 = single ?? clampLimit(req.query.limit24h, 14);
    const d7 = single ?? clampLimit(req.query.limit7d, 14);
    const d30 = single ?? clampLimit(req.query.limit30d, 18);
    const matchPerTopic = Math.min(6, Math.max(1, parseInt(req.query.match || '3', 10) || 3));

    const data = await getTrendsWithMatches({
      geo,
      limits: { h24, d7, d30 },
      matchPerTopic,
    });
    const totalLen = data.topics24h.length + data.topics7d.length + data.topics30d.length;
    const cacheEmpty = totalLen === 0;
    res.json({
      enabled: env.TRENDS_ENABLED,
      ...data,
      cacheEmpty,
      hint: cacheEmpty ? EMPTY_HINT : undefined,
      disclaimer:
        'Google Trends data via an unofficial API. Windows: ~24h (daily + realtime), 7d and 30d (related queries vs desk seeds). Verify stories independently.',
    });
  } catch (e) {
    console.error('[trends] getTrendsBundle', e);
    res.status(500).json({ error: 'Trends unavailable', message: e.message });
  }
}

/** POST /api/meta/trends/refresh: optional manual refresh (same as cron). */
export async function postTrendsRefresh(req, res) {
  const secret = req.headers['x-trends-secret'] || req.query.secret;
  if (env.TRENDS_REFRESH_SECRET && secret !== env.TRENDS_REFRESH_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const r = await refreshTrendsCache();
    res.json(r);
  } catch (e) {
    console.error('[trends] refresh', e);
    res.status(500).json({ ok: false, error: e.message });
  }
}

import { createRequire } from 'module';
import { env } from '../config/env.js';
import { TREND_SEEDS_BY_CATEGORY } from '../config/trends-seeds.js';
import * as trendsModel from '../models/trends.model.js';
import * as postModel from '../models/post.model.js';

const require = createRequire(import.meta.url);
const googleTrends = require('google-trends-api');

/** Avoid overlapping refreshes when cron is frequent and one run takes longer than the interval. */
let trendsRefreshInFlight = false;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * True if post title is plausibly about this trend query (substring or token overlap).
 */
function titleMatchesTrendQuery(title, query) {
  const t = normalizeText(title);
  const q = normalizeText(query);
  if (!t || !q || q.length < 2) return false;
  if (t.includes(q)) return true;
  const qWords = q.split(' ').filter((w) => w.length > 2);
  if (qWords.length === 0) return t.includes(q);
  const hits = qWords.filter((w) => t.includes(w)).length;
  return hits >= Math.max(1, Math.ceil(qWords.length * 0.55));
}

function parseRelatedQueriesRising(jsonStr) {
  let data;
  try {
    data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
  } catch {
    return [];
  }
  const lists = data?.default?.rankedList || [];
  const top = lists[0]?.rankedKeyword || [];
  const rising = lists[1]?.rankedKeyword || [];
  const out = [];
  for (const r of rising) {
    if (!r?.query) continue;
    const label = r.formattedValue === 'Breakout' ? 'Breakout' : 'Rising';
    out.push({ query: r.query, value_score: typeof r.value === 'number' ? r.value : null, trend_label: label });
  }
  for (const r of top.slice(0, 5)) {
    if (!r?.query) continue;
    out.push({
      query: r.query,
      value_score: typeof r.value === 'number' ? r.value : null,
      trend_label: 'Top',
    });
  }
  return out;
}

function firstArticleWhyFromDailyItem(item) {
  const articles = item?.articles;
  if (!Array.isArray(articles) || articles.length === 0) return null;
  for (const a of articles) {
    const t = a?.title || a?.articleTitle;
    const s = a?.snippet || a?.summary;
    const line = [t, s]
      .filter((x) => typeof x === 'string' && x.trim())
      .join(' — ');
    if (line) return line.slice(0, 4000);
  }
  return null;
}

function parseDailyTrends(jsonStr) {
  let data;
  try {
    data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
  } catch {
    return [];
  }
  const days = data?.default?.trendingSearchesDays || [];
  const out = [];
  for (const day of days.slice(0, 2)) {
    const searches = day?.trendingSearches || [];
    for (const item of searches) {
      const title = item?.title;
      const q =
        typeof title === 'string'
          ? title
          : title?.query ||
            title?.searchTitle ||
            item?.articleTitle ||
            item?.query ||
            item?.name;
      if (typeof q !== 'string' || !q.trim()) continue;
      const traffic =
        typeof item?.formattedTraffic === 'string'
          ? item.formattedTraffic.trim().slice(0, 64)
          : typeof item?.traffic === 'string'
            ? item.traffic.trim().slice(0, 64)
            : null;
      const why = firstArticleWhyFromDailyItem(item);
      out.push({
        query: q.trim(),
        value_score: null,
        trend_label: 'Daily',
        why_context: why,
        traffic_note: traffic,
        source: 'daily',
      });
    }
  }
  return out;
}

function parseRealTimeTrends(jsonStr) {
  let data;
  try {
    data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
  } catch {
    return [];
  }
  const stories = data?.storySummaries?.trendingStories || data?.trendingStories || [];
  const out = [];
  for (const s of stories) {
    const rawTitle = s?.title || (Array.isArray(s?.entityNames) ? s.entityNames[0] : null);
    const q = typeof rawTitle === 'string' ? rawTitle.trim() : '';
    if (!q) continue;
    const articles = s?.articles || [];
    let why = null;
    for (const a of articles) {
      const t = a?.title || a?.articleTitle;
      const sn = a?.snippet || a?.summary;
      const line = [t, sn]
        .filter((x) => typeof x === 'string' && x.trim())
        .join(' — ');
      if (line) {
        why = line.slice(0, 4000);
        break;
      }
    }
    out.push({
      query: q,
      value_score: null,
      trend_label: 'Realtime',
      why_context: why,
      traffic_note: null,
      source: 'realtime',
    });
  }
  return out;
}

function buildWhyForRelated(trend_label, daysBack) {
  if (trend_label === 'Breakout') {
    return 'Breakout: search interest jumped sharply versus the prior period in this window (Google Trends related queries).';
  }
  if (trend_label === 'Rising') {
    return `Rising: this query gained the most versus the previous span inside the last ${daysBack} days (Google Trends).`;
  }
  if (trend_label === 'Top') {
    return `Top related query for the desk seed in the last ${daysBack} days — often searched alongside that topic (Google Trends).`;
  }
  return null;
}

function dailyWhyFallback() {
  return 'Surfaced in Google Daily Trends for this region: queries that rose sharply in roughly the last 24 hours.';
}

function realtimeWhyFallback() {
  return 'Surfaced in Google Realtime trends: stories gaining traction across Search, News, and related surfaces in the last ~24 hours.';
}

async function fetchRelatedRange(keyword, geo, daysBack) {
  const endTime = new Date();
  const startTime = new Date();
  startTime.setDate(startTime.getDate() - daysBack);
  const raw = await googleTrends.relatedQueries({
    keyword,
    geo,
    startTime,
    endTime,
    hl: 'en-IN',
    granularTimeResolution: daysBack <= 2,
  });
  const parsed = parseRelatedQueriesRising(raw);
  return parsed.map((r) => ({
    ...r,
    why_context: buildWhyForRelated(r.trend_label, daysBack),
  }));
}

async function fetchDailySafe(geo) {
  const raw = await googleTrends.dailyTrends({
    geo,
    trendDate: new Date(),
    hl: 'en-IN',
  });
  return parseDailyTrends(raw);
}

async function fetchRealTimeSafe(geo) {
  const raw = await googleTrends.realTimeTrends({
    geo,
    category: 'all',
    hl: 'en-IN',
  });
  return parseRealTimeTrends(raw);
}

function dedupeTopics(rows) {
  const seen = new Map();
  const priority = { Breakout: 0, Rising: 1, Realtime: 2, Daily: 3, Top: 4, Seed: 6 };
  for (const r of rows) {
    const k = normalizeText(r.query_text);
    if (!k || k.length < 2) continue;
    const prev = seen.get(k);
    const pr = priority[r.trend_label] ?? 5;
    if (!prev || pr < (priority[prev.trend_label] ?? 5)) {
      seen.set(k, r);
    }
  }
  return [...seen.values()];
}

function ensureTimeframes(rows) {
  const tfs = ['24h', '7d', '30d'];
  const byTf = new Map(tfs.map((tf) => [tf, []]));
  for (const r of rows) {
    const tf = r.timeframe || '30d';
    if (!byTf.has(tf)) continue;
    byTf.get(tf).push(r);
  }
  const out = [];
  for (const tf of tfs) {
    let list = byTf.get(tf);
    if (list.length === 0) list = buildSeedFallbackRows(tf);
    out.push(...dedupeTopics(list));
  }
  return out;
}

/** When Google returns nothing for a window, still cache desk seeds so UI + Explore links work. */
function buildSeedFallbackRows(timeframe) {
  const out = [];
  for (const [category, seeds] of Object.entries(TREND_SEEDS_BY_CATEGORY)) {
    for (const seed of seeds) {
      out.push({
        category_key: category,
        query_text: seed.slice(0, 512),
        trend_label: 'Seed',
        value_score: null,
        seed_keyword: seed.slice(0, 128),
        source: 'seed',
        timeframe,
        why_context:
          timeframe === '24h'
            ? 'Desk seed — open Explore to see intraday and daily search interest for India.'
            : `Desk seed for the last ${timeframe === '7d' ? '7' : '30'} days window; Explore shows related queries and interest over time.`,
        traffic_note: null,
      });
    }
  }
  return dedupeTopics(out);
}

/**
 * Pull daily + realtime (24h) and related queries (7d / 30d) per desk; store in DB.
 * @returns {{ ok: boolean, count: number, error?: string }}
 */
export async function refreshTrendsCache() {
  if (!env.TRENDS_ENABLED) {
    return { ok: false, count: 0, error: 'TRENDS_ENABLED is not true' };
  }
  if (trendsRefreshInFlight) {
    return { ok: false, count: 0, skipped: true, error: 'Trends refresh already in progress' };
  }
  trendsRefreshInFlight = true;
  try {
    const geo = env.TRENDS_GEO || 'IN';
    const delayMs = Math.min(8000, Math.max(1500, env.TRENDS_REQUEST_DELAY_MS || 3500));
    const rows = [];

    try {
      const daily = await fetchDailySafe(geo);
      for (const d of daily.slice(0, 22)) {
        rows.push({
          category_key: 'India',
          query_text: d.query,
          trend_label: d.trend_label,
          value_score: d.value_score,
          seed_keyword: null,
          source: d.source || 'daily',
          timeframe: '24h',
          why_context: d.why_context || dailyWhyFallback(),
          traffic_note: d.traffic_note || null,
        });
      }
    } catch (e) {
      console.warn('[trends] dailyTrends failed:', e.message);
    }

    await sleep(delayMs);

    try {
      const rt = await fetchRealTimeSafe(geo);
      for (const d of rt.slice(0, 16)) {
        rows.push({
          category_key: 'India',
          query_text: d.query,
          trend_label: d.trend_label,
          value_score: d.value_score,
          seed_keyword: null,
          source: d.source || 'realtime',
          timeframe: '24h',
          why_context: d.why_context || realtimeWhyFallback(),
          traffic_note: d.traffic_note || null,
        });
      }
    } catch (e) {
      console.warn('[trends] realTimeTrends failed:', e.message);
    }

    for (const [category, seeds] of Object.entries(TREND_SEEDS_BY_CATEGORY)) {
      for (const seed of seeds) {
        try {
          const related7 = await fetchRelatedRange(seed, geo, 7);
          for (const r of related7.slice(0, 10)) {
            rows.push({
              category_key: category,
              query_text: r.query,
              trend_label: r.trend_label,
              value_score: r.value_score,
              seed_keyword: seed,
              source: 'related',
              timeframe: '7d',
              why_context: r.why_context,
              traffic_note: null,
            });
          }
        } catch (e) {
          console.warn(`[trends] relatedQueries 7d "${seed}" (${category}):`, e.message);
        }
        await sleep(delayMs);

        try {
          const related30 = await fetchRelatedRange(seed, geo, 30);
          for (const r of related30.slice(0, 10)) {
            rows.push({
              category_key: category,
              query_text: r.query,
              trend_label: r.trend_label,
              value_score: r.value_score,
              seed_keyword: seed,
              source: 'related',
              timeframe: '30d',
              why_context: r.why_context,
              traffic_note: null,
            });
          }
        } catch (e) {
          console.warn(`[trends] relatedQueries 30d "${seed}" (${category}):`, e.message);
        }
        await sleep(delayMs);
      }
    }

    let merged = ensureTimeframes(rows);
    const fromApi = merged.filter((r) => r.source !== 'seed').length;
    if (fromApi === 0 && merged.length > 0) {
      console.warn(
        `[trends] Google returned no usable topics; using seed fallback for all windows (${merged.length} rows). Check network / rate limits.`,
      );
    }
    await trendsModel.replaceTrendsForGeo(geo, merged);
    return {
      ok: true,
      count: merged.length,
      fromApi,
      usedSeedFallback: fromApi === 0 && merged.length > 0,
    };
  } finally {
    trendsRefreshInFlight = false;
  }
}

function exploreUrl(geo, query) {
  const q = encodeURIComponent(query);
  return `https://trends.google.com/trends/explore?geo=${geo}&q=${q}`;
}

function mapRowToTopic(t, g, matches) {
  return {
    category: t.category_key,
    query: t.query_text,
    label: t.trend_label,
    valueScore: t.value_score,
    source: t.source,
    timeframe: t.timeframe,
    exploreUrl: exploreUrl(g, t.query_text),
    matches,
    trafficNote: t.traffic_note || null,
  };
}

function attachMatches(topics, posts, matchPerTopic, g) {
  return topics.map((t) => {
    const matches = [];
    const candidates =
      t.category_key === 'India' && (t.source === 'daily' || t.source === 'realtime')
        ? posts
        : posts.filter((p) => p.category === t.category_key);
    for (const p of candidates) {
      if (titleMatchesTrendQuery(p.title, t.query_text)) {
        matches.push(p);
        if (matches.length >= matchPerTopic) break;
      }
    }
    if (matches.length === 0 && t.category_key !== 'India') {
      for (const p of posts) {
        if (titleMatchesTrendQuery(p.title, t.query_text)) {
          matches.push(p);
          if (matches.length >= matchPerTopic) break;
        }
      }
    }
    return mapRowToTopic(t, g, matches);
  });
}

/**
 * Cached topics (24h / 7d / 30d) + matched posts for API / UI.
 */
export async function getTrendsWithMatches({
  geo,
  limits = { h24: 14, d7: 14, d30: 18 },
  matchPerTopic = 3,
}) {
  const g = geo || env.TRENDS_GEO || 'IN';
  const maxAge = env.TRENDS_CACHE_MAX_AGE_HOURS || 48;
  const [raw24, raw7, raw30] = await Promise.all([
    trendsModel.listTrendsByGeoTimeframe(g, '24h', maxAge, limits.h24),
    trendsModel.listTrendsByGeoTimeframe(g, '7d', maxAge, limits.d7),
    trendsModel.listTrendsByGeoTimeframe(g, '30d', maxAge, limits.d30),
  ]);

  const posts = await postModel.listRecentForTrendMatching({
    hours: env.TRENDS_MATCH_POST_HOURS || 72,
    limit: env.TRENDS_MATCH_POST_LIMIT || 200,
  });

  const topics24h = attachMatches(raw24, posts, matchPerTopic, g);
  const topics7d = attachMatches(raw7, posts, matchPerTopic, g);
  const topics30d = attachMatches(raw30, posts, matchPerTopic, g);

  const lastAt = await trendsModel.getLatestTrendsFetchTime(g);
  return {
    geo: g,
    fetchedAt: lastAt ? new Date(lastAt).toISOString() : null,
    topics24h,
    topics7d,
    topics30d,
    topics: topics30d,
  };
}

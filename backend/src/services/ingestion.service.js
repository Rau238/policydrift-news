import slugify from 'slugify';
import { sha256Hex } from '../utils/hash.js';
import { excerptFromFeedContent, feedBodyToArticleHtml, toCleanString } from '../utils/string.js';
import * as postModel from '../models/post.model.js';
import * as sourceModel from '../models/source.model.js';
import { fetchAllFeedEntries } from './rss.service.js';
import { env } from '../config/env.js';
import { resolveStoryImageUrl } from '../utils/story-image.js';
import { getFeedEntries, RSS_FEEDS_BY_CATEGORY } from '../config/rss-feeds.js';
import { submitNewUrlsToIndexNow } from './indexnow.service.js';
import { buildKeyTakeawaysForCategory } from '../utils/key-takeaways.js';

const slugCache = new Set();

// ─── Slug allocation ──────────────────────────────────────────────────────────

async function allocateSlug(title) {
  const t = toCleanString(title);
  const base = slugify(t, { lower: true, strict: true, trim: true }) || 'post';
  let slug = base.slice(0, 200);
  for (let n = 0; n < 40; n += 1) {
    if (!slugCache.has(slug) && !(await postModel.slugExists(slug))) {
      slugCache.add(slug);
      return slug;
    }
    slug = `${base}-${Math.random().toString(36).slice(2, 9)}`.slice(0, 200);
  }
  slug = `${base}-${Date.now()}`.slice(0, 200);
  slugCache.add(slug);
  return slug;
}

// ─── Normalised title hash (content-level dedup) ──────────────────────────────

function normalizeTitle(title) {
  return toCleanString(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

function contentHash(title) {
  return sha256Hex(normalizeTitle(title));
}

// ─── Estimated reading time ───────────────────────────────────────────────────

function estimateReadingTime(html) {
  const words = (html || '')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── DB-source loading (falls back to rss-feeds.js) ──────────────────────────

/**
 * Seed or sync curated sources into news_sources table from hardcoded config.
 */
async function seedSourcesIfEmpty() {
  try {
    const { getCuratedFeedEntries } = await import('../config/rss-feeds.js');
    const entries = getCuratedFeedEntries();
    const result = await sourceModel.syncCuratedSources(entries);
    if (result.inserted > 0) {
      console.log(`[ingest] Seeded/synced ${result.inserted} new source(s) into news_sources.`);
    }
  } catch (e) {
    console.warn('[ingest] Could not sync sources:', e.message);
  }
}

/**
 * Load feed entries from the news_sources table.
 * Falls back to the hardcoded rss-feeds.js list if the table is empty or unavailable.
 */
async function loadFeedEntries() {
  try {
    await seedSourcesIfEmpty();
    const sources = await sourceModel.listSources({ includeDisabled: false });
    if (sources.length > 0) {
      return sources
        .filter((s) => s.rss_url)          // rss_url already resolved (COALESCE in SELECT)
        .map((s) => ({
          url: s.rss_url,
          category: s.category,
          sourceId: s.id,
          trustScore: Number(s.trust_score) || 70,
        }));
    }
  } catch (e) {
    console.warn('[ingest] DB source load failed, falling back to rss-feeds.js:', e.message);
  }
  // Fallback: hardcoded list (no sourceId)
  return getFeedEntries(env).map((e) => ({ ...e, sourceId: null, trustScore: 70 }));
}

// ─── Main ingest ──────────────────────────────────────────────────────────────

/**
 * Ingest new items from all enabled RSS sources (or a specific source/category).
 * Dedup order: url_hash → content_hash (normalised title).
 *
 * @param {{ sourceId?: number|string, category?: string }} [options]
 * @returns {{ created: number, skipped: number, errors: string[] }}
 */
export async function ingestFromRss({ sourceId = null, category = null } = {}) {
  let feedEntries = await loadFeedEntries();
  if (sourceId) {
    feedEntries = feedEntries.filter((e) => e.sourceId === Number(sourceId));
  } else if (category && category !== 'all') {
    feedEntries = feedEntries.filter((e) => (e.category || '').toLowerCase() === category.toLowerCase());
  }

  if (!feedEntries.length) {
    return {
      created: 0,
      skipped: 0,
      errors: ['No RSS feeds matched the criteria. Add sources in admin or rss-feeds.js.'],
    };
  }

  slugCache.clear();

  // Group by source so we can update per-source stats
  const bySource = new Map(); // sourceId → [feedEntry]
  for (const entry of feedEntries) {
    const key = entry.sourceId ?? 'none';
    if (!bySource.has(key)) bySource.set(key, []);
    bySource.get(key).push(entry);
  }

  let created = 0;
  let skipped = 0;
  const errors = [];
  const indexNowUrls = [];
  const siteOrigin = env.SITE_PUBLIC_URL?.replace(/\/$/, '');

  for (const [sourceId, entries] of bySource) {
    let sourceCreated = 0;
    let fetchedOk = false;

    // Trust Score Evaluation:
    // If trust_score >= 90, directly publish.
    // If trust_score < 90, send article to the Editorial Review Queue ('pending').
    const sourceTrust = Number(entries[0]?.trustScore) || 70;
    const isDirectPublish = sourceTrust >= 90;
    const status = isDirectPublish ? 'published' : 'pending';
    const autoPublished = isDirectPublish ? 1 : 0;

    let items = [];
    try {
      items = await fetchAllFeedEntries(entries);
      fetchedOk = true;
    } catch (e) {
      const msg = `Source ${sourceId}: fetch failed — ${e.message}`;
      errors.push(msg);
      if (sourceId !== 'none') {
        await sourceModel.recordFetchError(sourceId, e.message).catch(() => {});
      }
      continue; // one source failure must not stop others
    }

    items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    if (env.RSS_MAX_ITEMS > 0 && items.length > env.RSS_MAX_ITEMS) {
      items = items.slice(0, env.RSS_MAX_ITEMS);
    }

    for (const item of items) {
      const link  = toCleanString(item.link);
      const title = toCleanString(item.title);
      const urlHash  = sha256Hex(link);
      const cHash    = contentHash(title);

      try {
        // ── Dedup check 1: URL hash ───────────────────────────────────────
        const dupUrl = await postModel.findByUrlHash(urlHash);
        if (dupUrl) { skipped++; continue; }

        // ── Dedup check 2: Normalised title (content hash) ────────────────
        const dupContent = await postModel.findByContentHash(cHash);
        if (dupContent) { skipped++; continue; }

        const body        = feedBodyToArticleHtml(item.content);
        const excerpt     = excerptFromFeedContent(body, title);
        const category    = toCleanString(item.category || 'General').slice(0, 128) || 'General';
        const keyTakeaways = buildKeyTakeawaysForCategory({ category, excerpt, title, bodyHtml: body });
        const slug        = await allocateSlug(title);
        const publishedAt =
          item.pubDate instanceof Date && !Number.isNaN(item.pubDate.getTime())
            ? item.pubDate
            : new Date();

        await postModel.createPost({
          slug,
          title,
          excerpt,
          key_takeaways: keyTakeaways,
          body,
          original_url: link,
          url_hash: urlHash,
          content_hash: cHash,
          image_url: resolveStoryImageUrl(item.image ? toCleanString(item.image) : null),
          category,
          published_at: publishedAt,
          source_feed: item.feedUrl ? toCleanString(item.feedUrl) : null,
          source_id: sourceId !== 'none' ? Number(sourceId) : null,
          status,
          auto_published: autoPublished,
          reading_time_minutes: estimateReadingTime(body),
        });

        created++;
        sourceCreated++;

        if (status === 'published' && siteOrigin?.startsWith('https://')) {
          indexNowUrls.push(`${siteOrigin}/news/${encodeURIComponent(slug)}`);
        }
      } catch (e) {
        errors.push(`${link}: ${e.message}`);
      }
    }

    if (fetchedOk && sourceId !== 'none') {
      await sourceModel.recordFetchSuccess(sourceId, sourceCreated).catch(() => {});
    }
  }

  if (indexNowUrls.length) {
    await submitNewUrlsToIndexNow(indexNowUrls).catch((e) =>
      console.warn('[ingest] IndexNow error:', e.message),
    );
  }

  return { created, skipped, errors };
}

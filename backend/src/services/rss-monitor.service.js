/**
 * NewsFree365 — Real-time RSS News Monitoring Service
 *
 * Continuously monitors active RSS feeds, detects new articles, prevents duplicates,
 * extracts full article bodies via Readability/JSDOM, stores them into the database,
 * and emits internal NEW_ARTICLE events.
 */

import Parser from 'rss-parser';
import slugify from 'slugify';
import { sha256Hex } from '../utils/hash.js';
import { toCleanString, excerptFromFeedContent, feedBodyToArticleHtml, normalizeArticleUrl } from '../utils/string.js';
import { resolveStoryImageUrl } from '../utils/story-image.js';
import { buildKeyTakeawaysForCategory } from '../utils/key-takeaways.js';
import * as postModel from '../models/post.model.js';
import * as sourceModel from '../models/source.model.js';
import { extractArticle } from './article-extractor.service.js';
import { eventBus } from './events.service.js';
import { env } from '../config/env.js';
import { submitNewUrlsToIndexNow } from './indexnow.service.js';

const parser = new Parser({
  timeout: env.RSS_REQUEST_TIMEOUT || 15000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 NewsFree365Bot/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['media:group', 'mediaGroup', { keepArray: true }],
      ['itunes:image', 'itunesImage', { keepArray: true }],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

const slugCache = new Set();

/** Allocate unique slug for new article */
async function allocateSlug(title) {
  const t = toCleanString(title);
  const base = slugify(t, { lower: true, strict: true, trim: true }) || 'news';
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

function estimateReadingTime(html) {
  const words = (html || '')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function extractItemImage(item) {
  if (item.enclosure?.url && (item.enclosure.type?.startsWith('image/') || /\.(jpe?g|png|webp|gif)/i.test(item.enclosure.url))) {
    return item.enclosure.url;
  }
  if (item.mediaContent && Array.isArray(item.mediaContent)) {
    for (const m of item.mediaContent) {
      const u = m?.$?.url || m?.url;
      if (u) return u;
    }
  }
  if (item.mediaThumbnail && Array.isArray(item.mediaThumbnail)) {
    for (const m of item.mediaThumbnail) {
      const u = m?.$?.url || m?.url;
      if (u) return u;
    }
  }
  if (item.image?.url) return item.image.url;
  if (typeof item.image === 'string') return item.image;
  return null;
}

/**
 * Checks a single RSS feed, detects new items, extracts content, and saves articles.
 *
 * @param {{
 *   id?: number | string,
 *   name: string,
 *   url: string,
 *   category: string,
 *   trustScore?: number
 * }} feed
 * @returns {Promise<{ created: number, skipped: number, errors: string[] }>}
 */
export async function checkFeed(feed) {
  const feedUrl = toCleanString(feed.url || feed.rss_url);
  const feedName = toCleanString(feed.name || feedUrl);
  const feedId = feed.id || null;
  const feedCategory = toCleanString(feed.category || 'General');
  const trustScore = Number(feed.trust_score || feed.trustScore) || 75;
  const isDirectPublish = trustScore >= 90;
  const status = isDirectPublish ? 'published' : 'pending';
  const autoPublished = isDirectPublish ? 1 : 0;

  console.log(`[RSS] Checking ${feedName} (${feedUrl})`);

  let parsedFeed;
  try {
    parsedFeed = await parser.parseURL(feedUrl);
  } catch (err) {
    const errorMsg = `[RSS] Failed to parse ${feedName}: ${err.message}`;
    console.error(errorMsg);
    if (feedId) {
      await sourceModel.recordFetchError(feedId, err.message).catch(() => {});
    }
    return { created: 0, skipped: 0, errors: [errorMsg] };
  }

  const items = parsedFeed.items || [];
  console.log(`[RSS] ${items.length} items found for ${feedName}`);

  let created = 0;
  let skipped = 0;
  const errors = [];
  const indexNowUrls = [];
  const siteOrigin = env.SITE_PUBLIC_URL?.replace(/\/$/, '');

  // Sort descending by publication date
  items.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  const sliceLimit = env.RSS_MAX_ITEMS > 0 ? env.RSS_MAX_ITEMS : items.length;
  const processItems = items.slice(0, sliceLimit);

  for (const item of processItems) {
    const title = toCleanString(item.title);
    const link = toCleanString(item.link);
    const rawGuid = toCleanString(item.guid || item.id || '');
    const guid = rawGuid ? rawGuid.slice(0, 500) : null;
    const description = toCleanString(item.contentSnippet || item.summary || item.description || '');
    const rawContent = toCleanString(item.contentEncoded || item.content || description);
    const author = toCleanString(item.creator || item.author || '');
    const category = feedCategory || toCleanString(item.category || 'General').slice(0, 128);
    const rssImage = extractItemImage(item);

    if (!title || !link) {
      continue;
    }

    const urlHash = sha256Hex(link);
    const normLink = normalizeArticleUrl(link);
    const normUrlHash = normLink ? sha256Hex(normLink) : null;
    const cHash = contentHash(title);

    try {
      // ── Step 1: Duplicate check via GUID ─────────────────────────────────────
      if (guid) {
        const dupGuid = await postModel.findByGuid(guid);
        if (dupGuid) {
          skipped++;
          continue;
        }
      }

      // ── Step 2: Duplicate check via URL Hash ─────────────────────────────────
      const dupUrl = await postModel.findByUrlHash(urlHash);
      if (dupUrl) {
        skipped++;
        continue;
      }
      if (normUrlHash && normUrlHash !== urlHash) {
        const dupNormUrl = await postModel.findByUrlHash(normUrlHash);
        if (dupNormUrl) {
          skipped++;
          continue;
        }
      }

      // ── Step 3: Duplicate check via Content Hash (Title normalized) ─────────
      const dupContent = await postModel.findByContentHash(cHash);
      if (dupContent) {
        skipped++;
        continue;
      }

      console.log(`[RSS] New article detected: "${title}" (${link})`);

      // ── Full Article Extraction ─────────────────────────────────────────────
      let finalBody = feedBodyToArticleHtml(rawContent);
      let finalExcerpt = excerptFromFeedContent(finalBody, title);
      let finalAuthor = author || null;
      let finalImage = rssImage;
      let contentAvailable = 0;
      let extractionStatus = 'rss_only';
      let publishedAt =
        item.pubDate && !Number.isNaN(new Date(item.pubDate).getTime())
          ? new Date(item.pubDate)
          : new Date();

      if (env.RSS_EXTRACT_FULL_ARTICLE) {
        console.log(`[ARTICLE] Extracting article: ${link}`);
        const extracted = await extractArticle(link, {
          timeoutMs: env.RSS_REQUEST_TIMEOUT,
          maxRetries: env.RSS_MAX_RETRIES,
        });

        if (extracted.success && extracted.content) {
          finalBody = extracted.content;
          finalExcerpt = extracted.excerpt || finalExcerpt;
          finalAuthor = extracted.author || finalAuthor;
          finalImage = extracted.leadImage || finalImage;
          if (extracted.publishedAt) publishedAt = extracted.publishedAt;
          contentAvailable = 1;
          extractionStatus = 'full';
          console.log(`[ARTICLE] Extraction successful: "${extracted.title || title}"`);
        } else {
          extractionStatus = 'failed';
          console.log(`[ARTICLE] Extraction failed (${extracted.error}), falling back to RSS summary`);
        }
      }

      const slug = await allocateSlug(title);
      const keyTakeaways = buildKeyTakeawaysForCategory({
        category,
        excerpt: finalExcerpt,
        title,
        bodyHtml: finalBody,
      });

      const postId = await postModel.createPost({
        guid,
        slug,
        title,
        excerpt: finalExcerpt,
        key_takeaways: keyTakeaways,
        body: finalBody,
        original_url: link,
        url_hash: urlHash,
        content_hash: cHash,
        image_url: resolveStoryImageUrl(finalImage),
        category,
        published_at: publishedAt,
        source_feed: feedUrl,
        source_id: feedId ? Number(feedId) : null,
        status,
        auto_published: autoPublished,
        reading_time_minutes: estimateReadingTime(finalBody),
        author: finalAuthor,
        content_available: contentAvailable,
        extraction_status: extractionStatus,
      });

      created++;
      console.log(`[DATABASE] Article saved: ${postId} (status: ${status}, extraction: ${extractionStatus})`);

      // ── Dispatch internal event ─────────────────────────────────────────────
      eventBus.emitNewArticle({
        articleId: postId,
        source: feedName,
        title,
        url: link,
        publishedAt,
        category,
        slug,
        contentAvailable: contentAvailable === 1,
        extractionStatus,
      });

      if (status === 'published' && siteOrigin?.startsWith('https://')) {
        indexNowUrls.push(`${siteOrigin}/news/${encodeURIComponent(slug)}`);
      }
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('Duplicate entry')) {
        console.log(`[RSS] Duplicate article ignored during concurrent insert: "${title}"`);
        skipped++;
      } else {
        console.error(`[DATABASE] Error saving article "${title}":`, err.message);
        errors.push(`${title}: ${err.message}`);
      }
    }
  }

  if (feedId) {
    await sourceModel.recordFetchSuccess(feedId, created).catch(() => {});
  }

  if (indexNowUrls.length) {
    submitNewUrlsToIndexNow(indexNowUrls).catch((e) =>
      console.warn('[RSS] IndexNow error:', e.message),
    );
  }

  return { created, skipped, errors };
}

/**
 * Checks all active RSS feeds across the system.
 * Continues processing remaining feeds even if one or more fail.
 */
export async function checkAllFeeds() {
  slugCache.clear();
  const sources = await sourceModel.listSources({ includeDisabled: false });
  const activeFeeds = sources.filter((s) => s.url || s.rss_url);

  console.log(`[RSS] Starting check-all for ${activeFeeds.length} active feed(s)`);

  let totalCreated = 0;
  let totalSkipped = 0;
  const allErrors = [];

  for (const feed of activeFeeds) {
    try {
      const result = await checkFeed({
        id: feed.id,
        name: feed.name,
        url: feed.rss_url || feed.url,
        category: feed.category,
        trustScore: feed.trust_score,
      });
      totalCreated += result.created;
      totalSkipped += result.skipped;
      if (result.errors?.length) allErrors.push(...result.errors);
    } catch (err) {
      console.error(`[RSS] Unhandled error checking feed "${feed.name}":`, err.message);
      allErrors.push(`${feed.name}: ${err.message}`);
    }
  }

  console.log(`[RSS] Check-all completed: ${totalCreated} created, ${totalSkipped} skipped, ${allErrors.length} errors`);
  return { created: totalCreated, skipped: totalSkipped, errors: allErrors };
}

export const rssMonitorService = { checkFeed, checkAllFeeds };


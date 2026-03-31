import slugify from 'slugify';
import { sha256Hex } from '../utils/hash.js';
import { excerptFromFeedContent, feedBodyToArticleHtml, toCleanString } from '../utils/string.js';
import * as postModel from '../models/post.model.js';
import { fetchAllFeedEntries } from './rss.service.js';
import { env } from '../config/env.js';
import { resolveStoryImageUrl } from '../utils/story-image.js';
import { getFeedEntries } from '../config/rss-feeds.js';

const slugCache = new Set();

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

/**
 * Ingest new items from configured RSS feeds (skips duplicates by url hash).
 * @returns {{ created: number, skipped: number, errors: string[] }}
 */
export async function ingestFromRss() {
  const feedEntries = getFeedEntries(env);
  if (!feedEntries.length) {
    return {
      created: 0,
      skipped: 0,
      errors: ['No RSS feeds: add URLs to backend/src/config/rss-feeds.js and/or RSS_FEED_URLS in .env'],
    };
  }

  slugCache.clear();
  let items = await fetchAllFeedEntries(feedEntries);
  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  if (env.RSS_MAX_ITEMS > 0 && items.length > env.RSS_MAX_ITEMS) {
    items = items.slice(0, env.RSS_MAX_ITEMS);
  }
  const errors = [];
  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const link = toCleanString(item.link);
    const title = toCleanString(item.title);
    const urlHash = sha256Hex(link);
    try {
      const dup = await postModel.findByUrlHash(urlHash);
      if (dup) {
        skipped += 1;
        continue;
      }

      const body = feedBodyToArticleHtml(item.content);
      const excerpt = excerptFromFeedContent(body, title);

      const slug = await allocateSlug(title);

      const publishedAt =
        item.pubDate instanceof Date && !Number.isNaN(item.pubDate.getTime())
          ? item.pubDate
          : new Date();

      await postModel.createPost({
        slug,
        title,
        excerpt,
        body,
        original_url: link,
        url_hash: urlHash,
        image_url: resolveStoryImageUrl(item.image ? toCleanString(item.image) : null),
        category: toCleanString(item.category || 'General').slice(0, 128) || 'General',
        published_at: publishedAt,
        source_feed: item.feedUrl ? toCleanString(item.feedUrl) : null,
      });
      created += 1;
    } catch (e) {
      errors.push(`${link}: ${e.message}`);
    }
  }

  return { created, skipped, errors };
}

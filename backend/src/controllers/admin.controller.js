/**
 * Admin Controller
 * All endpoints require requireAdmin middleware.
 * Handles /api/admin/* endpoints.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as postModel from '../models/post.model.js';
import * as sourceModel from '../models/source.model.js';
import { serializePostDates } from '../utils/date.js';
import { ingestFromRss } from '../services/ingestion.service.js';
import { runRankingPass } from '../services/ranking.service.js';
import { runMetricsAggregation } from '../services/metrics.service.js';
import {
  publishScheduledArticles,
  expireBreakingNews,
  expireFeaturedArticles,
} from '../services/scheduler.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Dashboard Stats & Activity ───────────────────────────────────────────────

export async function getStats(req, res, next) {
  try {
    const stats = await postModel.getAdminStats();
    res.json(stats);
  } catch (e) {
    next(e);
  }
}

export async function getActivity(req, res, next) {
  try {
    const { pool } = await import('../db/pool.js');
    // Fetch latest 15 articles created or updated
    const [recentArticles] = await pool.query(
      `SELECT p.id, p.title, p.slug, p.status, p.category, p.created_at, p.published_at, p.view_count, ns.name AS source_name
       FROM posts p
       LEFT JOIN news_sources ns ON ns.id = p.source_id
       ORDER BY p.created_at DESC
       LIMIT 15`,
    );

    // Fetch latest active sources status
    const [sources] = await pool.query(
      `SELECT id, name, category, is_active, last_fetched_at, last_success_at, last_error, articles_imported
       FROM news_sources
       ORDER BY last_fetched_at DESC
       LIMIT 10`,
    );

    res.json({
      recentArticles: recentArticles.map(serializePostDates),
      recentSources: sources.map(serializePostDates),
      serverTime: new Date().toISOString(),
    });
  } catch (e) {
    next(e);
  }
}

// ─── Article CRUD ─────────────────────────────────────────────────────────────

export async function listArticles(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const status = req.query.status || null;
    const category = req.query.category || null;
    const search = req.query.search || req.query.q || null;
    const sort = req.query.sort || 'created_at_desc';
    const is_featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : null;
    const is_breaking = req.query.breaking === 'true' ? true : req.query.breaking === 'false' ? false : null;
    const origin = req.query.origin || null;

    const data = await postModel.adminListPosts({
      page,
      limit,
      status,
      category,
      search,
      sort,
      is_featured,
      is_breaking,
      origin,
    });

    res.json({
      ...data,
      posts: data.posts.map(serializePostDates),
    });
  } catch (e) {
    next(e);
  }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 280);
}

export async function createArticle(req, res, next) {
  try {
    const {
      title,
      excerpt,
      key_takeaways,
      takeaways: altTakeaways,
      body,
      image_url,
      category,
      author,
      tags,
      status = 'published',
      is_featured = false,
      featured_hours = 24,
      is_breaking = false,
      breaking_hours = 4,
      editorial_priority = 'normal',
      timeline = [],
      slug: customSlug,
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Article title is required.' });
    }

    const cleanTitle = String(title).trim();
    let baseSlug = (customSlug ? slugify(customSlug) : slugify(cleanTitle)) || `story-${Date.now()}`;
    let finalSlug = baseSlug;
    let count = 1;

    // Check slug collision
    while (await postModel.slugExists(finalSlug)) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    // Format Key Takeaways if array
    const rawTakeaways = key_takeaways || altTakeaways;
    let takeawaysStr = '';
    if (Array.isArray(rawTakeaways)) {
      takeawaysStr = rawTakeaways.map((t) => (typeof t === 'string' ? t.trim() : '')).filter(Boolean).join('\n');
    } else if (typeof rawTakeaways === 'string') {
      takeawaysStr = rawTakeaways.trim();
    }

    // Embed structured timeline if provided
    let finalBody = body || '';
    if (Array.isArray(timeline) && timeline.length > 0) {
      const validTimeline = timeline.filter((t) => t && (t.title || t.time || t.description));
      if (validTimeline.length > 0) {
        const timelineJson = JSON.stringify(validTimeline);
        const timelineComment = `<!-- STORY_TIMELINE:${timelineJson} -->`;
        if (!finalBody.includes('<!-- STORY_TIMELINE:')) {
          finalBody = `${finalBody}\n\n${timelineComment}`;
        }
      }
    }

    // Auto calculate reading time
    const totalWords = `${cleanTitle} ${excerpt || ''} ${finalBody}`.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(totalWords / 200));

    const urlHash = crypto.createHash('sha256').update(finalSlug + ':' + Date.now()).digest('hex');
    const contentHash = crypto.createHash('sha256').update(cleanTitle + ':' + finalBody.slice(0, 500)).digest('hex');

    const breakingUntil = is_breaking ? new Date(Date.now() + Number(breaking_hours || 4) * 3600 * 1000) : null;
    const featuredUntil = is_featured ? new Date(Date.now() + Number(featured_hours || 24) * 3600 * 1000) : null;

    const newId = await postModel.createPost({
      slug: finalSlug,
      title: cleanTitle,
      excerpt: excerpt ? String(excerpt).trim() : null,
      key_takeaways: takeawaysStr || null,
      body: finalBody,
      original_url: '',
      url_hash: urlHash,
      content_hash: contentHash,
      image_url: image_url ? String(image_url).trim() : null,
      category: category || 'General',
      published_at: status === 'published' ? new Date() : null,
      source_feed: 'PolicyDrift Editorial Desk',
      source_id: null,
      status: ['published', 'draft', 'pending'].includes(status) ? status : 'published',
      auto_published: 0,
      reading_time_minutes: readingTime,
      author: author ? String(author).trim() : 'PolicyDrift Editorial Desk',
      tags: tags || null,
      is_featured: is_featured ? 1 : 0,
      featured_until: featuredUntil,
      is_breaking: is_breaking ? 1 : 0,
      breaking_until: breakingUntil,
      editorial_priority: ['normal', 'high', 'pinned'].includes(editorial_priority) ? editorial_priority : 'normal',
    });

    const createdPost = await postModel.findById(newId);

    res.status(201).json({
      ok: true,
      id: newId,
      slug: finalSlug,
      message: 'Article created successfully!',
      article: serializePostDates(createdPost),
    });
  } catch (e) {
    next(e);
  }
}

export async function getArticle(req, res, next) {
  try {
    const rawId = req.params.id;
    let post = null;
    if (/^\d+$/.test(String(rawId))) {
      post = await postModel.findById(parseInt(rawId, 10));
    }
    if (!post) {
      post = await postModel.findBySlug(String(rawId));
    }
    if (!post) return res.status(404).json({ error: 'Article not found' });
    res.json(serializePostDates(post));
  } catch (e) {
    next(e);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid article ID' });

    const payload = { ...req.body };

    // Format Key Takeaways if array
    if (Array.isArray(payload.key_takeaways)) {
      payload.key_takeaways = payload.key_takeaways
        .map((t) => (typeof t === 'string' ? t.trim() : ''))
        .filter(Boolean)
        .join('\n');
    }

    // Format tags if array
    if (Array.isArray(payload.tags)) {
      payload.tags = JSON.stringify(payload.tags.map((t) => String(t).trim()).filter(Boolean));
    }

    // Embed structured timeline if provided
    if (Array.isArray(payload.timeline)) {
      const validTimeline = payload.timeline.filter((t) => t && (t.title || t.time || t.description));
      let currentBody = (payload.body || '').replace(/<!--\s*STORY_TIMELINE:[\s\S]*?-->/g, '').trim();
      if (validTimeline.length > 0) {
        currentBody = `${currentBody}\n\n<!-- STORY_TIMELINE:${JSON.stringify(validTimeline)} -->`;
      }
      payload.body = currentBody;
      delete payload.timeline;
    }

    if (payload.title && !payload.slug) {
      // Keep existing slug unless explicitly provided
    }

    const n = await postModel.updatePost(id, payload);
    const updatedPost = await postModel.findById(id);

    res.json({
      ok: true,
      message: 'Article updated successfully',
      affected: n,
      article: serializePostDates(updatedPost),
    });
  } catch (e) {
    next(e);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid article ID' });

    const isPermanent = req.query.permanent === 'true' || req.query.force === 'true';
    const post = await postModel.findById(id);

    // If already archived or explicitly requested as permanent delete -> delete row completely
    if (isPermanent || post?.status === 'archived') {
      const affected = await postModel.bulkDeletePosts([id]);
      return res.json({ ok: true, message: 'Article permanently deleted from database', affected });
    }

    const [result] = await (await import('../db/pool.js')).pool.query(
      'UPDATE posts SET status = ? WHERE id = ?',
      ['archived', id],
    );
    res.json({ ok: true, message: 'Article moved to Archive', affected: result.affectedRows });
  } catch (e) {
    next(e);
  }
}

// ─── Article Editorial Actions ────────────────────────────────────────────────

export async function publishArticle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const n = await postModel.updatePost(id, {
      status: 'published',
      published_at: new Date(),
    });
    res.json({ ok: true, message: 'Article published successfully', affected: n });
  } catch (e) {
    next(e);
  }
}

export async function unpublishArticle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const n = await postModel.updatePost(id, { status: 'draft' });
    res.json({ ok: true, message: 'Article moved to draft', affected: n });
  } catch (e) {
    next(e);
  }
}

export async function scheduleArticle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const scheduledAt = req.body?.scheduled_at || req.body?.scheduledAt;
    if (!scheduledAt) return res.status(400).json({ error: 'scheduled_at is required' });
    const n = await postModel.updatePost(id, {
      status: 'pending',
      scheduled_at: new Date(scheduledAt),
    });
    res.json({ ok: true, message: `Article scheduled for ${new Date(scheduledAt).toLocaleString()}`, affected: n });
  } catch (e) {
    next(e);
  }
}

export async function featureArticle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { hours = 24 } = req.body || {};
    const until = new Date(Date.now() + Number(hours) * 3600 * 1000);
    const n = await postModel.updatePost(id, { is_featured: 1, featured_until: until });
    res.json({
      ok: true,
      message: `Article featured for ${hours}h`,
      featured_until: until.toISOString(),
      affected: n,
    });
  } catch (e) {
    next(e);
  }
}

export async function unfeatureArticle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const n = await postModel.updatePost(id, { is_featured: 0, featured_until: null });
    res.json({ ok: true, message: 'Article unfeatured', affected: n });
  } catch (e) {
    next(e);
  }
}

export async function markBreaking(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { hours = 2 } = req.body || {};
    const until = new Date(Date.now() + Number(hours) * 3600 * 1000);
    const n = await postModel.updatePost(id, { is_breaking: 1, breaking_until: until });
    res.json({
      ok: true,
      message: `Article marked as breaking news for ${hours}h`,
      breaking_until: until.toISOString(),
      affected: n,
    });
  } catch (e) {
    next(e);
  }
}

export async function unmarkBreaking(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const n = await postModel.updatePost(id, { is_breaking: 0, breaking_until: null });
    res.json({ ok: true, message: 'Article unmarked as breaking', affected: n });
  } catch (e) {
    next(e);
  }
}

export async function setPriority(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const priority = req.body?.priority;
    if (!['normal', 'high', 'pinned'].includes(priority)) {
      return res.status(400).json({ error: 'priority must be normal | high | pinned' });
    }
    const n = await postModel.updatePost(id, { editorial_priority: priority });
    res.json({ ok: true, message: `Priority set to ${priority}`, affected: n });
  } catch (e) {
    next(e);
  }
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────

export async function bulkActionArticles(req, res, next) {
  try {
    const { action, ids, hours, priority, category } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ ok: false, error: 'No article IDs provided' });
    }

    const cleanIds = ids.map((i) => parseInt(i, 10)).filter(Boolean);
    if (!cleanIds.length) {
      return res.status(400).json({ ok: false, error: 'No valid numeric IDs provided' });
    }

    let affected = 0;
    let message = '';

    switch (action) {
      case 'publish':
        affected = await postModel.bulkUpdatePosts(cleanIds, {
          status: 'published',
          published_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        });
        message = `Published ${affected} articles`;
        break;

      case 'unpublish':
        affected = await postModel.bulkUpdatePosts(cleanIds, { status: 'draft' });
        message = `Unpublished ${affected} articles (moved to Drafts)`;
        break;

      case 'feature': {
        const h = hours ? parseInt(hours, 10) : 24;
        const until = new Date(Date.now() + h * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        affected = await postModel.bulkUpdatePosts(cleanIds, {
          is_featured: 1,
          featured_until: until,
        });
        message = `Marked ${affected} articles as Featured for ${h}h`;
        break;
      }

      case 'unfeature':
        affected = await postModel.bulkUpdatePosts(cleanIds, {
          is_featured: 0,
          featured_until: null,
        });
        message = `Unmarked ${affected} articles from Featured`;
        break;

      case 'breaking': {
        const h = hours ? parseInt(hours, 10) : 2;
        const until = new Date(Date.now() + h * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        affected = await postModel.bulkUpdatePosts(cleanIds, {
          is_breaking: 1,
          breaking_until: until,
        });
        message = `Marked ${affected} articles as Breaking News for ${h}h`;
        break;
      }

      case 'unbreaking':
        affected = await postModel.bulkUpdatePosts(cleanIds, {
          is_breaking: 0,
          breaking_until: null,
        });
        message = `Unmarked ${affected} articles from Breaking News`;
        break;

      case 'priority': {
        const prio = priority || 'normal';
        if (!['normal', 'high', 'pinned'].includes(prio)) {
          return res.status(400).json({ ok: false, error: 'priority must be normal | high | pinned' });
        }
        affected = await postModel.bulkUpdatePosts(cleanIds, { editorial_priority: prio });
        message = `Set editorial priority to "${prio}" on ${affected} articles`;
        break;
      }

      case 'category':
        if (!category) {
          return res.status(400).json({ ok: false, error: 'Category is required' });
        }
        affected = await postModel.bulkUpdatePosts(cleanIds, { category });
        message = `Moved ${affected} articles to category "${category}"`;
        break;

      case 'archive':
        affected = await postModel.bulkUpdatePosts(cleanIds, { status: 'archived' });
        message = `Archived ${affected} articles`;
        break;

      case 'delete':
        affected = await postModel.bulkDeletePosts(cleanIds);
        message = `Permanently deleted ${affected} articles`;
        break;

      default:
        return res.status(400).json({ ok: false, error: `Unknown bulk action "${action}"` });
    }

    res.json({ ok: true, message, affected, ids: cleanIds });
  } catch (e) {
    next(e);
  }
}

/** Publish all pending (review queue) articles in one operation */
export async function publishAllPendingArticles(req, res, next) {
  try {
    const category = req.body?.category || req.query?.category || null;
    const affected = await postModel.publishAllPendingArticles({ category });
    res.json({
      ok: true,
      message:
        affected > 0
          ? `Successfully published all ${affected} review articles live`
          : 'No pending articles found in the review queue to publish',
      affected,
    });
  } catch (e) {
    next(e);
  }
}

// ─── Source CRUD ──────────────────────────────────────────────────────────────

export async function listSources(req, res, next) {
  try {
    const includeDisabled = req.query.all === 'true';
    const sources = await sourceModel.listSources({ includeDisabled });
    res.json(sources.map(serializePostDates));
  } catch (e) {
    next(e);
  }
}

export async function createSource(req, res, next) {
  try {
    const body = req.body || {};
    const name = body.name?.trim();
    const rss_url = (body.rss_url || body.rssUrl)?.trim();
    const category = body.category || 'politics';
    const trust_score = body.trust_score ?? body.trustScore ?? 70;
    const country = body.country || 'IN';
    const language = body.language || 'en';
    const fetch_interval_minutes = body.fetch_interval_minutes ?? body.fetchIntervalMinutes ?? 15;

    if (!name) return res.status(400).json({ error: 'Source name is required' });
    if (!rss_url) return res.status(400).json({ error: 'RSS URL is required' });

    const id = await sourceModel.createSource({
      name,
      rss_url,
      category,
      trust_score,
      country,
      language,
      fetch_interval_minutes,
      is_active: body.enabled !== false && body.is_active !== 0 ? 1 : 0,
    });

    res.status(201).json({ ok: true, message: `Source "${name}" created successfully`, id });
  } catch (e) {
    next(e);
  }
}

export async function updateSource(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid source ID' });

    const body = req.body || {};
    const payload = {};

    if (body.name !== undefined) payload.name = body.name;
    if (body.rss_url !== undefined) payload.rss_url = body.rss_url;
    if (body.rssUrl !== undefined) payload.rss_url = body.rssUrl;
    if (body.category !== undefined) payload.category = body.category;
    if (body.trust_score !== undefined) payload.trust_score = body.trust_score;
    if (body.trustScore !== undefined) payload.trust_score = body.trustScore;
    if (body.country !== undefined) payload.country = body.country;
    if (body.language !== undefined) payload.language = body.language;
    if (body.fetch_interval_minutes !== undefined) payload.fetch_interval_minutes = body.fetch_interval_minutes;
    if (body.fetchIntervalMinutes !== undefined) payload.fetch_interval_minutes = body.fetchIntervalMinutes;

    if (body.enabled !== undefined) payload.is_active = body.enabled ? 1 : 0;
    if (body.is_active !== undefined) payload.is_active = body.is_active ? 1 : 0;

    const n = await sourceModel.updateSource(id, payload);
    res.json({ ok: true, message: 'Source updated successfully', affected: n });
  } catch (e) {
    next(e);
  }
}

export async function deleteSource(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid source ID' });
    const n = await sourceModel.deleteSource(id);
    res.json({ ok: true, message: 'Source deleted successfully', affected: n });
  } catch (e) {
    next(e);
  }
}

export async function syncCuratedSources(req, res, next) {
  try {
    const { getCuratedFeedEntries } = await import('../config/rss-feeds.js');
    const entries = getCuratedFeedEntries();
    const result = await sourceModel.syncCuratedSources(entries);
    res.json({
      ok: true,
      message: `Synced ${result.total} curated feeds into database (${result.inserted} added, ${result.updated} updated)`,
      ...result,
    });
  } catch (e) {
    next(e);
  }
}

export async function testFeedUrl(req, res, next) {
  try {
    const url = (req.body?.url || req.query?.url || '').trim();
    const category = req.body?.category || req.query?.category || 'General';
    if (!url) return res.status(400).json({ ok: false, error: 'RSS feed URL is required' });

    const { fetchFeedItems } = await import('../services/rss.service.js');
    const items = await fetchFeedItems(url, category);
    res.json({
      ok: true,
      message: `Verified feed: ${items.length} items parsed successfully`,
      itemCount: items.length,
      sample: items.slice(0, 5).map((i) => ({
        title: i.title,
        link: i.link,
        pubDate: i.pubDate || i.isoDate,
        hasImage: !!i.imageUrl,
        imageUrl: i.imageUrl || null,
        excerpt: i.content ? i.content.slice(0, 160) + '...' : null,
      })),
    });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message || 'Failed to fetch and parse RSS feed' });
  }
}

export async function testSource(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const source = await sourceModel.getSourceById(id);
    if (!source) return res.status(404).json({ error: 'Source not found' });
    if (!source.rss_url) return res.status(400).json({ error: 'Source has no RSS feed URL configured' });

    const { fetchFeedItems } = await import('../services/rss.service.js');
    const items = await fetchFeedItems(source.rss_url, source.category);
    res.json({
      ok: true,
      message: `Verified feed "${source.name}" — ${items.length} items found`,
      itemCount: items.length,
      sample: items.slice(0, 5).map((i) => ({
        title: i.title,
        link: i.link,
        pubDate: i.pubDate || i.isoDate,
        hasImage: !!i.imageUrl,
        imageUrl: i.imageUrl || null,
        excerpt: i.content ? i.content.slice(0, 160) + '...' : null,
      })),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || 'Failed to fetch RSS feed' });
  }
}

export async function fetchSource(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const source = await sourceModel.getSourceById(id);
    if (!source) return res.status(404).json({ error: 'Source not found' });
    const result = await ingestFromRss({ sourceId: id, category: source.category });
    res.json({ ok: true, message: `Fetched feed for "${source.name}"`, ...result });
  } catch (e) {
    next(e);
  }
}

// ─── Worker Triggers ──────────────────────────────────────────────────────────

export async function triggerIngest(req, res, next) {
  try {
    const result = await ingestFromRss();
    res.json({
      ok: true,
      message: `RSS Ingest completed: ${result.created || 0} created, ${result.skipped || 0} skipped`,
      ...result,
    });
  } catch (e) {
    next(e);
  }
}

export async function triggerRanking(req, res, next) {
  try {
    const result = await runRankingPass();
    res.json({
      ok: true,
      message: `Ranking pass completed: ${result.ranked || 0} articles scored`,
      ...result,
    });
  } catch (e) {
    next(e);
  }
}

export async function triggerMetrics(req, res, next) {
  try {
    const result = await runMetricsAggregation();
    res.json({
      ok: true,
      message: `Metrics aggregation completed: ${result.aggregated || 0} posts updated`,
      ...result,
    });
  } catch (e) {
    next(e);
  }
}

export async function triggerScheduler(req, res, next) {
  try {
    const [pub, brk, feat] = await Promise.all([
      publishScheduledArticles(),
      expireBreakingNews(),
      expireFeaturedArticles(),
    ]);
    res.json({
      ok: true,
      message: `Scheduler executed: ${pub.published || 0} published, ${brk.expired || 0} breaking expired, ${feat.expired || 0} featured expired`,
      published: pub.published || 0,
      breakingExpired: brk.expired || 0,
      featuredExpired: feat.expired || 0,
    });
  } catch (e) {
    next(e);
  }
}

// ─── Image & Media Upload ───────────────────────────────────────────────────

export async function uploadImages(req, res, next) {
  try {
    const { images, files } = req.body || {};
    const items = Array.isArray(images) ? images : Array.isArray(files) ? files : [];

    if (!items.length) {
      return res.status(400).json({ ok: false, error: 'No image data provided. Send an array of base64 images.' });
    }

    const uploadDir = path.resolve(__dirname, '../../../frontend/public/uploads/articles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploaded = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let base64Data = '';
      let ext = 'jpg';
      let originalName = (item && item.name) || `image-${i + 1}`;

      if (typeof item === 'string') {
        base64Data = item;
      } else if (item && typeof item === 'object') {
        base64Data = item.data || item.base64 || item.url || '';
        if (item.type) {
          const matchType = String(item.type).match(/image\/(png|jpeg|jpg|webp|gif|svg\+xml|svg)/i);
          if (matchType) {
            ext = matchType[1] === 'jpeg' ? 'jpg' : matchType[1] === 'svg+xml' ? 'svg' : matchType[1];
          }
        }
      }

      if (!base64Data) continue;

      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      let rawBase64 = base64Data;
      if (matches) {
        const mimeExt = matches[1].toLowerCase();
        ext = mimeExt === 'jpeg' ? 'jpg' : mimeExt === 'svg+xml' ? 'svg' : mimeExt;
        rawBase64 = matches[2];
      }

      const buffer = Buffer.from(rawBase64, 'base64');
      const safeFilename = `art-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      const filePath = path.join(uploadDir, safeFilename);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/articles/${safeFilename}`;
      uploaded.push({
        url: publicUrl,
        filename: safeFilename,
        name: originalName,
        size: buffer.length,
        type: `image/${ext}`,
      });
    }

    res.status(201).json({
      ok: true,
      message: `Successfully uploaded ${uploaded.length} image(s)`,
      files: uploaded,
      urls: uploaded.map((u) => u.url),
    });
  } catch (e) {
    next(e);
  }
}


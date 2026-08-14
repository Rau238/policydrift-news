/**
 * Admin Controller
 * All endpoints require requireAdmin middleware.
 * Handles /api/admin/* endpoints.
 */

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

    const data = await postModel.adminListPosts({
      page,
      limit,
      status,
      category,
      search,
      sort,
      is_featured,
      is_breaking,
    });

    res.json({
      ...data,
      posts: data.posts.map(serializePostDates),
    });
  } catch (e) {
    next(e);
  }
}

export async function getArticle(req, res, next) {
  try {
    const post = await postModel.findBySlug(req.params.id);
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
    const n = await postModel.updatePost(id, req.body || {});
    res.json({ ok: true, message: 'Article updated successfully', affected: n });
  } catch (e) {
    next(e);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid article ID' });
    const [result] = await (await import('../db/pool.js')).pool.query(
      'UPDATE posts SET status = ? WHERE id = ?',
      ['archived', id],
    );
    res.json({ ok: true, message: 'Article archived successfully', affected: result.affectedRows });
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

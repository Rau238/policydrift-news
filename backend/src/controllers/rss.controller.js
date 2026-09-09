/**
 * NewsFree365 — RSS Feed Controller
 *
 * Exposes management endpoints for RSS feeds:
 * GET    /api/rss/feeds
 * POST   /api/rss/feeds
 * PUT    /api/rss/feeds/:id
 * DELETE /api/rss/feeds/:id
 * POST   /api/rss/feeds/:id/check
 * POST   /api/rss/check-all
 * POST   /api/rss/test
 */

import * as sourceModel from '../models/source.model.js';
import { checkFeed as checkFeedService, checkAllFeeds as checkAllFeedsService } from '../services/rss-monitor.service.js';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 NewsFree365/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8',
  },
});

function formatFeed(source) {
  const isEnabled = source.enabled !== undefined ? !!source.enabled : !!source.is_active;
  return {
    id: source.id,
    name: source.name,
    url: source.rss_url || source.url || '',
    category: source.category || 'General',
    enabled: isEnabled,
    trust_score: source.trust_score ?? 70,
    country: source.country || 'IN',
    language: source.language || 'en',
    last_checked_at: source.last_checked_at || source.last_fetched_at || null,
    last_success_at: source.last_success_at || null,
    last_error: source.last_error || null,
    articles_imported: source.articles_imported || 0,
    created_at: source.created_at || null,
    updated_at: source.updated_at || null,
  };
}

export async function listFeeds(req, res, next) {
  try {
    const includeDisabled = req.query.all !== 'false';
    const sources = await sourceModel.listSources({ includeDisabled });
    res.json(sources.map(formatFeed));
  } catch (err) {
    next(err);
  }
}

export async function getFeed(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ ok: false, error: 'Invalid feed ID' });

    const source = await sourceModel.getSourceById(id);
    if (!source) return res.status(404).json({ ok: false, error: 'Feed not found' });

    res.json(formatFeed(source));
  } catch (err) {
    next(err);
  }
}

export async function createFeed(req, res, next) {
  try {
    const { name, url, rss_url, category, enabled, trust_score, country, language } = req.body || {};
    const feedUrl = (rss_url || url || '').trim();

    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, error: 'Feed name is required' });
    }
    if (!feedUrl) {
      return res.status(400).json({ ok: false, error: 'Feed URL is required' });
    }

    const id = await sourceModel.createSource({
      name: name.trim(),
      rss_url: feedUrl,
      category: category?.trim() || 'General',
      is_active: enabled !== false ? 1 : 0,
      trust_score: trust_score ?? 70,
      country: country || 'IN',
      language: language || 'en',
    });

    const created = await sourceModel.getSourceById(id);
    res.status(201).json({
      ok: true,
      message: `Feed "${name}" added successfully`,
      feed: formatFeed(created),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateFeed(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ ok: false, error: 'Invalid feed ID' });

    const source = await sourceModel.getSourceById(id);
    if (!source) return res.status(404).json({ ok: false, error: 'Feed not found' });

    const { name, url, rss_url, category, enabled, is_active, trust_score, country, language } = req.body || {};
    const payload = {};

    if (name !== undefined) payload.name = name.trim();
    if (url !== undefined || rss_url !== undefined) payload.rss_url = (rss_url || url || '').trim();
    if (category !== undefined) payload.category = category.trim();
    if (enabled !== undefined) payload.is_active = enabled ? 1 : 0;
    if (is_active !== undefined) payload.is_active = is_active ? 1 : 0;
    if (trust_score !== undefined) payload.trust_score = Number(trust_score);
    if (country !== undefined) payload.country = country;
    if (language !== undefined) payload.language = language;

    await sourceModel.updateSource(id, payload);
    const updated = await sourceModel.getSourceById(id);

    res.json({
      ok: true,
      message: 'Feed updated successfully',
      feed: formatFeed(updated),
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteFeed(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ ok: false, error: 'Invalid feed ID' });

    const affected = await sourceModel.deleteSource(id);
    if (!affected) return res.status(404).json({ ok: false, error: 'Feed not found' });

    res.json({ ok: true, message: 'Feed deleted successfully', id });
  } catch (err) {
    next(err);
  }
}

export async function checkFeed(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ ok: false, error: 'Invalid feed ID' });

    const source = await sourceModel.getSourceById(id);
    if (!source) return res.status(404).json({ ok: false, error: 'Feed not found' });

    const feedUrl = source.rss_url || source.url;
    if (!feedUrl) return res.status(400).json({ ok: false, error: 'Feed has no URL configured' });

    const result = await checkFeedService({
      id: source.id,
      name: source.name,
      url: feedUrl,
      category: source.category,
      trustScore: source.trust_score,
    });

    res.json({
      ok: true,
      message: `Checked feed "${source.name}": ${result.created} new article(s), ${result.skipped} skipped`,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkAll(req, res, next) {
  try {
    const result = await checkAllFeedsService();
    res.json({
      ok: true,
      message: `Checked all feeds: ${result.created} new article(s), ${result.skipped} skipped`,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

export async function testFeed(req, res, next) {
  try {
    const url = (req.body?.url || req.query?.url || '').trim();
    if (!url) return res.status(400).json({ ok: false, error: 'Feed URL is required' });

    const feed = await parser.parseURL(url);
    const items = (feed.items || []).slice(0, 5).map((i) => ({
      title: i.title,
      link: i.link,
      guid: i.guid || i.id || null,
      pubDate: i.pubDate || i.isoDate || null,
      author: i.creator || i.author || null,
      description: i.contentSnippet || i.summary || i.description || null,
    }));

    res.json({
      ok: true,
      message: `Feed verified: ${feed.items?.length || 0} items found`,
      title: feed.title || null,
      description: feed.description || null,
      itemCount: feed.items?.length || 0,
      sample: items,
    });
  } catch (err) {
    res.status(400).json({ ok: false, error: `Feed test failed: ${err.message}` });
  }
}

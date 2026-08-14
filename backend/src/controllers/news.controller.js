/**
 * Public News Controller
 * Handles /api/news/* endpoints.
 */

import crypto from 'crypto';
import * as postModel from '../models/post.model.js';
import { recordEvent } from '../models/events.model.js';
import { serializePostDates } from '../utils/date.js';
import { withStoryImageFallback } from '../utils/story-image.js';
import { env } from '../config/env.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serialize(post) {
  return serializePostDates(withStoryImageFallback(post));
}

function serializeMany(posts) {
  return posts.map(serialize);
}

/** SHA-256 of the request IP, never stored raw. */
function ipHash(req) {
  const raw = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

function clampLimit(v, def, max = 100) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? def : Math.min(max, Math.max(1, n));
}

// ─── GET /api/news/latest ─────────────────────────────────────────────────────

export async function getLatest(req, res, next) {
  try {
    const page     = Math.max(1, parseInt(req.query.page  || '1', 10));
    const limit    = clampLimit(req.query.limit, 20, 100);
    const category = req.query.category || null;
    const source   = req.query.source   ? parseInt(req.query.source, 10) : null;

    const data = await postModel.listLatest({ category, source, page, limit });
    res.json({ ...data, posts: serializeMany(data.posts) });
  } catch (e) { next(e); }
}

// ─── GET /api/news/top ────────────────────────────────────────────────────────

export async function getTop(req, res, next) {
  try {
    const limit = clampLimit(req.query.limit, 10, 50);
    const days  = Math.min(30, Math.max(1, parseInt(req.query.days || String(env.RANKING_TOP_DAYS || 7), 10)));
    const posts = await postModel.listTop({ limit, days });
    res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.json(serializeMany(posts));
  } catch (e) { next(e); }
}

// ─── GET /api/news/trending ───────────────────────────────────────────────────

export async function getTrendingNews(req, res, next) {
  try {
    const limit = clampLimit(req.query.limit, 10, 50);
    const days  = Math.min(7, Math.max(1, parseInt(req.query.days || String(env.RANKING_TRENDING_DAYS || 2), 10)));
    const posts = await postModel.listTrendingRanked({ limit, days });
    res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.json(serializeMany(posts));
  } catch (e) { next(e); }
}

// ─── GET /api/news/popular ────────────────────────────────────────────────────

export async function getPopular(req, res, next) {
  try {
    const limit  = clampLimit(req.query.limit, 10, 50);
    const period = ['day', 'week', 'month'].includes(req.query.period)
      ? req.query.period
      : 'day';
    const posts = await postModel.listPopular({ limit, period });
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.json(serializeMany(posts));
  } catch (e) { next(e); }
}

// ─── GET /api/news/:slug ──────────────────────────────────────────────────────

export async function getNewsBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const post = await postModel.findPublishedBySlug(slug);
    if (!post) return res.status(404).json({ error: 'Not found' });

    // Record view event with IP dedup
    const hash = ipHash(req);
    const inserted = await recordEvent({
      postId: post.id,
      eventType: 'view',
      ipHash: hash,
      sessionId: req.headers['x-session-id'] || null,
    });

    // Only increment the denormalised view_count when this is a genuine new view
    if (inserted) {
      await postModel.incrementViews(post.id);
      post.view_count = (post.view_count || 0) + 1;
    }

    res.json(serialize(post));
  } catch (e) { next(e); }
}

// ─── POST /api/news/:id/events ────────────────────────────────────────────────
// Client-side engagement events (like, share, bookmark).

export async function postEvent(req, res, next) {
  try {
    const postId    = parseInt(req.params.id, 10);
    const eventType = req.body?.eventType;
    const validTypes = ['view', 'like', 'share', 'bookmark', 'comment', 'click'];

    if (!postId || !validTypes.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid postId or eventType' });
    }

    const hash = ipHash(req);
    await recordEvent({
      postId,
      eventType,
      ipHash: hash,
      sessionId: req.body?.sessionId || req.headers['x-session-id'] || null,
    });

    res.json({ ok: true });
  } catch (e) { next(e); }
}

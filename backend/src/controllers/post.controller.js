import * as postModel from '../models/post.model.js';
import { ingestFromRss } from '../services/ingestion.service.js';
import { serializePostDates } from '../utils/date.js';
import { withStoryImageFallback } from '../utils/story-image.js';

export async function listPosts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '12', 10)));
    const category = req.query.category || 'all';
    const data = await postModel.listPosts({ category, page, limit });
    res.json({
      ...data,
      posts: data.posts.map((p) => serializePostDates(withStoryImageFallback(p))),
    });
  } catch (e) {
    next(e);
  }
}

export async function getPostBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const post = await postModel.findBySlug(slug);
    if (!post) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await postModel.incrementViews(post.id);
    post.view_count = (post.view_count || 0) + 1;
    res.json(serializePostDates(withStoryImageFallback(post)));
  } catch (e) {
    next(e);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await postModel.listCategories();
    res.json(categories);
  } catch (e) {
    next(e);
  }
}

export async function getTrending(req, res, next) {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || '6', 10)));
    const days = Math.min(30, Math.max(1, parseInt(req.query.days || '7', 10)));
    const posts = await postModel.listTrending({ limit, days });
    res.set('Cache-Control', 'private, no-store, max-age=0');
    res.json(posts.map((p) => serializePostDates(withStoryImageFallback(p))));
  } catch (e) {
    next(e);
  }
}

export async function triggerIngest(req, res, next) {
  try {
    const result = await ingestFromRss();
    res.json(result);
  } catch (e) {
    next(e);
  }
}

// ─── Sitemap Endpoints (High-Scale 1,000,000+ Articles) ────────────────────────

// In-memory short TTL caches to protect MySQL under heavy Googlebot/crawler bursts
let sitemapIndexCache = null;
let sitemapIndexCacheExpires = 0;
const sitemapChunkCache = new Map(); // key -> { expires, data }

export async function getSitemapIndexData(req, res, next) {
  try {
    const now = Date.now();
    if (sitemapIndexCache && sitemapIndexCacheExpires > now) {
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      return res.json(sitemapIndexCache);
    }

    const totalArticles = await postModel.getPublishedPostsCount();
    const latestLastMod = await postModel.getLatestPublishedModTime();
    const chunkSize = 50000;
    const totalChunks = Math.max(1, Math.ceil(totalArticles / chunkSize));

    const payload = {
      totalArticles,
      chunkSize,
      totalChunks,
      latestLastMod: latestLastMod instanceof Date ? latestLastMod.toISOString() : new Date(latestLastMod).toISOString(),
    };

    sitemapIndexCache = payload;
    sitemapIndexCacheExpires = now + 5 * 60 * 1000; // 5 min cache

    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.json(payload);
  } catch (e) {
    next(e);
  }
}

export async function getSitemapChunkData(req, res, next) {
  try {
    const chunk = Math.max(1, parseInt(req.query.chunk || req.query.page || '1', 10));
    const limit = Math.min(50000, Math.max(1, parseInt(req.query.limit || '50000', 10)));
    const cacheKey = `${chunk}:${limit}`;
    const now = Date.now();

    const cached = sitemapChunkCache.get(cacheKey);
    if (cached && cached.expires > now) {
      res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=1800');
      return res.json(cached.data);
    }

    const rows = await postModel.listPublishedPostsChunk({ chunk, limit });
    const articles = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      lastmod: r.updated_at
        ? new Date(r.updated_at).toISOString()
        : r.published_at
          ? new Date(r.published_at).toISOString()
          : new Date().toISOString(),
    }));

    const payload = {
      chunk,
      limit,
      count: articles.length,
      articles,
    };

    sitemapChunkCache.set(cacheKey, {
      expires: now + 10 * 60 * 1000, // 10 min cache
      data: payload,
    });

    res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=1800');
    res.json(payload);
  } catch (e) {
    next(e);
  }
}

export async function getSitemapData(req, res, next) {
  try {
    const rows = await postModel.listSlugsForSitemap();
    res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=1800');
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

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

export async function getSitemapData(req, res, next) {
  try {
    const rows = await postModel.listSlugsForSitemap();
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

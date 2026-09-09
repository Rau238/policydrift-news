/**
 * NewsFree365 — RSS Feed Routes
 *
 * GET    /api/rss/feeds
 * POST   /api/rss/feeds
 * GET    /api/rss/feeds/:id
 * PUT    /api/rss/feeds/:id
 * DELETE /api/rss/feeds/:id
 * POST   /api/rss/feeds/:id/check
 * POST   /api/rss/check-all
 * POST   /api/rss/test
 */

import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import * as rssController from '../controllers/rss.controller.js';

const router = Router();

// Feed management
router.get('/feeds', rssController.listFeeds);
router.get('/feeds/:id', rssController.getFeed);
router.post('/feeds', requireAdmin, rssController.createFeed);
router.put('/feeds/:id', requireAdmin, rssController.updateFeed);
router.delete('/feeds/:id', requireAdmin, rssController.deleteFeed);

// Monitoring and manual triggers
router.post('/feeds/:id/check', requireAdmin, rssController.checkFeed);
router.post('/check-all', requireAdmin, rssController.checkAll);
router.post('/test', requireAdmin, rssController.testFeed);

export default router;

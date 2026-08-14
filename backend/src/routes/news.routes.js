import { Router } from 'express';
import * as newsController from '../controllers/news.controller.js';

const router = Router();

// Public feeds (distinct ranking per endpoint)
router.get('/latest',   newsController.getLatest);
router.get('/top',      newsController.getTop);
router.get('/trending', newsController.getTrendingNews);
router.get('/popular',  newsController.getPopular);

// Single article (with view dedup)
router.get('/:slug',    newsController.getNewsBySlug);

// Client-side engagement events
router.post('/:id/events', newsController.postEvent);

export default router;

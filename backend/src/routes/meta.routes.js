import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';
import * as trendsController from '../controllers/trends.controller.js';

const router = Router();
router.get('/slugs', postController.getSitemapData);
router.get('/trends', trendsController.getTrendsBundle);
router.post('/trends/refresh', trendsController.postTrendsRefresh);

export default router;

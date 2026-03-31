import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';
import * as marketQuotesController from '../controllers/market-quotes.controller.js';

const router = Router();

router.get('/market-quotes', marketQuotesController.getMarketQuotes);
router.get('/posts', postController.listPosts);
router.get('/posts/trending', postController.getTrending);
router.get('/posts/categories', postController.getCategories);
router.post('/posts/ingest', postController.triggerIngest);
router.get('/posts/:slug', postController.getPostBySlug);

export default router;

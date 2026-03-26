import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';

const router = Router();

router.get('/posts', postController.listPosts);
router.get('/posts/trending', postController.getTrending);
router.get('/posts/categories', postController.getCategories);
router.post('/posts/ingest', postController.triggerIngest);
router.get('/posts/:slug', postController.getPostBySlug);

export default router;

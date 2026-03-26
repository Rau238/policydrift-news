import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';

const router = Router();
router.get('/slugs', postController.getSitemapData);

export default router;

import { Router } from 'express';
import * as newsletterController from '../controllers/newsletter.controller.js';

const router = Router();

router.post('/subscribe', newsletterController.subscribe);
router.all('/unsubscribe', newsletterController.unsubscribe);
router.get('/count', newsletterController.getPublicCount);

export default router;

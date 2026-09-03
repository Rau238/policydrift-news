import { Router } from 'express';
import * as pushController from '../controllers/push.controller.js';

const router = Router();

// Public client subscription endpoints
router.post('/subscribe', pushController.subscribe);
router.post('/unsubscribe', pushController.unsubscribe);
router.get('/vapid-public-key', pushController.getVapidKey);

export default router;

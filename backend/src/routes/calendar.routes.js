/**
 * NewsFree365 — Calendar Routes
 */

import { Router } from 'express';
import { getCalendar } from '../controllers/calendar.controller.js';

const router = Router();

router.get('/', getCalendar);

export default router;

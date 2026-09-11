import { Router } from 'express';
import * as PollController from '../controllers/poll.controller.js';

const router = Router();

router.get('/active', PollController.getActivePoll);
router.post('/:id/vote', PollController.submitVote);

export default router;

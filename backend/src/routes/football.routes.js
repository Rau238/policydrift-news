import { Router } from 'express';
import {
  getFootballOverview,
  getFootballRecent,
  getFootballMatchDetails,
  streamFootballLiveScores,
} from '../controllers/football.controller.js';

const router = Router();

router.get('/overview', getFootballOverview);
router.get('/recent', getFootballRecent);
router.get('/match/:id', getFootballMatchDetails);
router.get('/stream/:id?', streamFootballLiveScores);

export default router;

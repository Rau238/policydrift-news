import { Router } from 'express';
import * as cricketController from '../controllers/cricket.controller.js';

const router = Router();

// GET /api/cricket/overview -> All live, recent, upcoming matches summary
router.get('/overview', cricketController.getOverview);

// GET /api/cricket/recent -> Recently completed matches
router.get('/recent', cricketController.getRecentMatches);

// GET /api/cricket/match/:id -> Full live or completed scorecard for match
router.get('/match/:id', cricketController.getMatchDetails);

// GET /api/cricket/stream -> Real-time overview broadcast
router.get('/stream', cricketController.streamLiveScores);

// GET /api/cricket/stream/:id -> Real-time ball-by-ball updates for a specific match
router.get('/stream/:id', cricketController.streamLiveScores);

export default router;

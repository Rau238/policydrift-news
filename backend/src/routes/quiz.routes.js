import { Router } from 'express';
import * as quizController from '../controllers/quiz.controller.js';

const router = Router();

// Public endpoints
router.get('/today', quizController.getTodayQuiz);
router.get('/active', quizController.getTodayQuiz);

export default router;

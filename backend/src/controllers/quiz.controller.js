import * as quizModel from '../models/quiz.model.js';

/**
 * Public: Get today's active quiz questions.
 */
export async function getTodayQuiz(req, res) {
  try {
    const { date } = req.query;
    const questions = await quizModel.getActiveDailyQuiz(date);
    res.json({
      ok: true,
      editionDate: date || new Date().toISOString().slice(0, 10),
      total: questions.length,
      questions,
    });
  } catch (err) {
    console.error('[quiz.controller] getTodayQuiz error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch daily quiz questions' });
  }
}

/**
 * Admin: List all quiz questions with filtering and pagination.
 */
export async function listQuizAdmin(req, res) {
  try {
    const { status, date, search, page, limit } = req.query;
    const result = await quizModel.listAdminQuizQuestions({
      status,
      date,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[quiz.controller] listQuizAdmin error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Failed to list quiz questions' });
  }
}

/**
 * Admin: Get single question by ID.
 */
export async function getQuizByIdAdmin(req, res) {
  try {
    const { id } = req.params;
    const question = await quizModel.getQuizQuestionById(id);
    if (!question) {
      return res.status(404).json({ ok: false, error: 'Question not found' });
    }
    res.json({ ok: true, question });
  } catch (err) {
    console.error('[quiz.controller] getQuizByIdAdmin error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Failed to fetch question' });
  }
}

/**
 * Admin: Create a new quiz question.
 */
export async function createQuizAdmin(req, res) {
  try {
    const data = req.body;
    const created = await quizModel.createQuizQuestion(data);
    res.status(201).json({ ok: true, message: 'Quiz question created successfully', question: created });
  } catch (err) {
    console.error('[quiz.controller] createQuizAdmin error:', err);
    res.status(400).json({ ok: false, error: err.message || 'Failed to create quiz question' });
  }
}

/**
 * Admin: Update an existing quiz question.
 */
export async function updateQuizAdmin(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await quizModel.updateQuizQuestion(id, data);
    res.json({ ok: true, message: 'Quiz question updated successfully', question: updated });
  } catch (err) {
    console.error('[quiz.controller] updateQuizAdmin error:', err);
    res.status(400).json({ ok: false, error: err.message || 'Failed to update quiz question' });
  }
}

/**
 * Admin: Delete a quiz question.
 */
export async function deleteQuizAdmin(req, res) {
  try {
    const { id } = req.params;
    const success = await quizModel.deleteQuizQuestion(id);
    if (!success) {
      return res.status(404).json({ ok: false, error: 'Quiz question not found or already deleted' });
    }
    res.json({ ok: true, message: 'Quiz question deleted successfully' });
  } catch (err) {
    console.error('[quiz.controller] deleteQuizAdmin error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Failed to delete quiz question' });
  }
}

/**
 * Admin: Toggle active status.
 */
export async function toggleQuizAdmin(req, res) {
  try {
    const { id } = req.params;
    const updated = await quizModel.toggleQuizQuestionActive(id);
    res.json({ ok: true, message: `Quiz question ${updated.isActive ? 'activated' : 'deactivated'}`, question: updated });
  } catch (err) {
    console.error('[quiz.controller] toggleQuizAdmin error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Failed to toggle quiz status' });
  }
}

/**
 * Admin: Seed default set of questions.
 */
export async function seedDefaultsAdmin(req, res) {
  try {
    const { date } = req.body || {};
    const questions = await quizModel.seedDefaultQuizQuestions(date);
    res.json({ ok: true, message: 'Default quiz questions seeded successfully', questions });
  } catch (err) {
    console.error('[quiz.controller] seedDefaultsAdmin error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Failed to seed default questions' });
  }
}

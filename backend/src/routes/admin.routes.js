import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';
import * as socialController from '../controllers/social.controller.js';
import * as pushController from '../controllers/push.controller.js';
import { env } from '../config/env.js';

const router = Router();

function getExpectedAdminSecret() {
  return (env.ADMIN_SECRET || process.env.INSIGHTS_ADMIN_SECRET || 'Raunak@123').trim();
}

// ── Authentication Endpoints ──────────────────────────────────────────────────
router.get('/auth', (req, res) => {
  const secret = getExpectedAdminSecret();
  const header = req.headers['x-admin-secret'];
  const bearer = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
  const cookieHeader = req.headers.cookie || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)pd_admin=([^;]+)/);
  const cookieVal = cookieMatch ? decodeURIComponent(cookieMatch[1]).trim() : '';

  const token = header || bearer || cookieVal;

  if (token && token === secret) {
    return res.json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false });
});

router.post('/auth', (req, res) => {
  const secret = (req.body?.secret || '').trim();
  const expected = getExpectedAdminSecret();

  if (!secret || secret !== expected) {
    return res.status(401).json({ ok: false, error: 'Invalid admin secret key.' });
  }

  const isProd = env.NODE_ENV === 'production';
  res.cookie('pd_admin', expected, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json({ ok: true, message: 'Authentication successful' });
});

router.delete('/auth', (_req, res) => {
  res.clearCookie('pd_admin', { path: '/' });
  return res.json({ ok: true, message: 'Logged out successfully' });
});

// All protected admin routes require authentication
router.use(requireAdmin);

// ── Overview & Diagnostics ───────────────────────────────────────────────────
router.get('/stats',                       adminController.getStats);
router.get('/activity',                    adminController.getActivity);

// ── Articles ──────────────────────────────────────────────────────────────────
router.get('/articles',                    adminController.listArticles);
router.post('/articles/bulk',               adminController.bulkActionArticles);
router.post('/articles/publish-all-pending', adminController.publishAllPendingArticles);
router.post('/articles/publish-all-review',  adminController.publishAllPendingArticles);
router.get('/articles/:id',                adminController.getArticle);
router.put('/articles/:id',                adminController.updateArticle);
router.patch('/articles/:id',              adminController.updateArticle);
router.delete('/articles/:id',             adminController.deleteArticle);

// Editorial actions
router.post('/articles/:id/publish',       adminController.publishArticle);
router.post('/articles/:id/unpublish',     adminController.unpublishArticle);
router.post('/articles/:id/schedule',      adminController.scheduleArticle);
router.post('/articles/:id/feature',       adminController.featureArticle);
router.post('/articles/:id/unfeature',     adminController.unfeatureArticle);
router.post('/articles/:id/breaking',      adminController.markBreaking);
router.post('/articles/:id/unbreaking',    adminController.unmarkBreaking);
router.post('/articles/:id/priority',      adminController.setPriority);

// ── Sources ───────────────────────────────────────────────────────────────────
router.get('/sources',                     adminController.listSources);
router.post('/sources',                    adminController.createSource);
router.post('/sources/sync-curated',       adminController.syncCuratedSources);
router.post('/sources/test-url',           adminController.testFeedUrl);
router.put('/sources/:id',                 adminController.updateSource);
router.patch('/sources/:id',               adminController.updateSource);
router.delete('/sources/:id',              adminController.deleteSource);
router.post('/sources/:id/test',           adminController.testSource);
router.post('/sources/:id/fetch',          adminController.fetchSource);

// ── Social Media Automation & Publishing ─────────────────────────────────────
router.post('/social/publish',             socialController.publishPost);
router.get('/social/status',               socialController.getStatus);
router.get('/social/logs',                 socialController.getLogs);

// ── Web Push Notifications ───────────────────────────────────────────────────
router.post('/push/broadcast',             pushController.broadcastPush);
router.get('/push/status',                 pushController.getPushStatus);

// ── Worker triggers ───────────────────────────────────────────────────────────
router.post('/ingest',                     adminController.triggerIngest);
router.post('/ranking',                    adminController.triggerRanking);
router.post('/metrics',                    adminController.triggerMetrics);
router.post('/scheduler',                  adminController.triggerScheduler);

export default router;

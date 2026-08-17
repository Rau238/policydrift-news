import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require the x-admin-secret header
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

// ── Worker triggers ───────────────────────────────────────────────────────────
router.post('/ingest',                     adminController.triggerIngest);
router.post('/ranking',                    adminController.triggerRanking);
router.post('/metrics',                    adminController.triggerMetrics);
router.post('/scheduler',                  adminController.triggerScheduler);

export default router;

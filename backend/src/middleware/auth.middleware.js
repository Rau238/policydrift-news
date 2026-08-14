import { env } from '../config/env.js';

/**
 * Lightweight admin authentication middleware.
 *
 * Checks `x-admin-secret` header (or `Authorization: Bearer <secret>`).
 * Set ADMIN_SECRET in .env / .env.production.
 *
 * If ADMIN_SECRET is not configured, all admin routes return 503.
 */
export function requireAdmin(req, res, next) {
  const secret = env.ADMIN_SECRET;

  if (!secret) {
    return res.status(503).json({
      error: 'Admin not configured',
      hint: 'Set ADMIN_SECRET in your .env file.',
    });
  }

  const header = req.headers['x-admin-secret'];
  const bearer = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
  const token = header || bearer;

  if (!token || token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

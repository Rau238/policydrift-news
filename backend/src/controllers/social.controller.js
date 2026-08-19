import * as socialService from '../services/social.service.js';

/**
 * POST /api/admin/social/publish
 */
export async function publishPost(req, res) {
  try {
    const { articleId, title, slug, category, channels, captions, aspectRatio, sourceName, imageUrl } = req.body || {};

    if (!title || !channels || !Array.isArray(channels) || channels.length === 0) {
      return res.status(400).json({ ok: false, error: 'Missing required parameters (title, channels).' });
    }

    const result = await socialService.dispatchSocialPost({
      ...req.body,
      captions: captions || {},
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to dispatch social post.' });
  }
}

/**
 * GET /api/admin/social/status
 */
export async function getStatus(req, res) {
  try {
    const channels = socialService.getSocialChannelStatus();
    const logs = socialService.getRecentSocialLogs();
    return res.json({ ok: true, channels, logs });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to retrieve social status.' });
  }
}

/**
 * GET /api/admin/social/logs
 */
export async function getLogs(req, res) {
  try {
    const logs = socialService.getRecentSocialLogs();
    return res.json({ ok: true, logs });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to retrieve social logs.' });
  }
}

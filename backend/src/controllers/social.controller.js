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
    const config = socialService.getSocialConfig();
    const logs = await socialService.getRecentSocialLogs(30, 0);
    return res.json({ ok: true, channels, config, logs });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to retrieve social status.' });
  }
}

/**
 * GET /api/admin/social/logs
 */
export async function getLogs(req, res) {
  try {
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);
    const logs = await socialService.getRecentSocialLogs(limit, offset);
    return res.json({ ok: true, logs });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to retrieve social logs.' });
  }
}

/**
 * DELETE /api/admin/social/logs/:id
 */
export async function deleteLog(req, res) {
  try {
    const id = req.params.id;
    const ok = await socialService.deleteSocialLog(id);
    return res.json({ ok, message: ok ? 'Log deleted successfully' : 'Log not found' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to delete log.' });
  }
}

/**
 * DELETE /api/admin/social/logs
 */
export async function clearLogs(req, res) {
  try {
    const count = await socialService.clearAllSocialLogs();
    return res.json({ ok: true, message: `Cleared ${count} logs.` });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to clear logs.' });
  }
}

/**
 * POST /api/admin/social/test-connection
 */
export async function testConnection(req, res) {
  try {
    const { channel, credentials } = req.body || {};
    if (!channel) {
      return res.status(400).json({ ok: false, error: 'Channel name required.' });
    }

    const testResult = await socialService.testChannelConnection(channel, credentials || {});
    return res.json(testResult);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Connection test failed.' });
  }
}

/**
 * POST /api/admin/social/credentials
 */
export async function updateCredentials(req, res) {
  try {
    const { credentials } = req.body || {};
    if (!credentials || typeof credentials !== 'object') {
      return res.status(400).json({ ok: false, error: 'Missing credentials object.' });
    }

    const envUpdate = {};
    if (credentials.telegramBotToken !== undefined) envUpdate.TELEGRAM_BOT_TOKEN = credentials.telegramBotToken;
    if (credentials.telegramChatId !== undefined) envUpdate.TELEGRAM_CHAT_ID = credentials.telegramChatId;
    if (credentials.whatsappWebhookUrl !== undefined) envUpdate.WHATSAPP_WEBHOOK_URL = credentials.whatsappWebhookUrl;
    if (credentials.whatsappApiToken !== undefined) envUpdate.WHATSAPP_API_TOKEN = credentials.whatsappApiToken;
    if (credentials.whatsappPhoneId !== undefined) envUpdate.WHATSAPP_PHONE_ID = credentials.whatsappPhoneId;
    if (credentials.whatsappRecipient !== undefined) envUpdate.WHATSAPP_RECIPIENT_NUMBER = credentials.whatsappRecipient;
    if (credentials.socialWebhookUrl !== undefined) envUpdate.SOCIAL_WEBHOOK_URL = credentials.socialWebhookUrl;
    if (credentials.twitterApiKey !== undefined) envUpdate.TWITTER_API_KEY = credentials.twitterApiKey;
    if (credentials.linkedinAccessToken !== undefined) envUpdate.LINKEDIN_ACCESS_TOKEN = credentials.linkedinAccessToken;
    if (credentials.metaAccessToken !== undefined) envUpdate.META_ACCESS_TOKEN = credentials.metaAccessToken;

    const result = socialService.updateEnvFile(envUpdate);
    const updatedStatus = socialService.getSocialChannelStatus();

    return res.json({
      ok: true,
      message: 'Channel credentials updated and applied successfully.',
      channels: updatedStatus,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Failed to update credentials.' });
  }
}


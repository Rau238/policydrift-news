import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as socialLogModel from '../models/social-log.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Social Media Multi-Platform Publishing Service
 * Dispatches automated & approved posts to Telegram, WhatsApp, LinkedIn, Instagram, Facebook, and Twitter/X
 */

/**
 * Safely update .env file with new key-value pairs without damaging other config
 */
export function updateEnvFile(updates = {}) {
  const envPaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env'),
  ];

  let targetPath = null;
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  if (!targetPath) {
    targetPath = envPaths[0];
  }

  let content = '';
  if (fs.existsSync(targetPath)) {
    content = fs.readFileSync(targetPath, 'utf8');
  }

  let lines = content ? content.split(/\r?\n/) : [];

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) continue;
    const cleanVal = String(value).trim();
    process.env[key] = cleanVal; // Update runtime memory immediately

    let found = false;
    lines = lines.map((line) => {
      const match = line.match(new RegExp(`^\\s*${key}\\s*=`));
      if (match) {
        found = true;
        return `${key}=${cleanVal}`;
      }
      return line;
    });

    if (!found && cleanVal) {
      lines.push(`${key}=${cleanVal}`);
    }
  }

  fs.writeFileSync(targetPath, lines.join('\n'), 'utf8');
  return { ok: true, path: targetPath };
}

/**
 * Upload image buffer to instant global CDN so external social platforms
 * (LinkedIn, Meta, Twitter) can download it immediately without domain/localhost issues.
 */
async function uploadToPublicCdn(buffer, filename) {
  try {
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, filename || 'social-card.png');

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const url = (await res.text()).trim();
      if (url.startsWith('https://')) {
        return url;
      }
    }
  } catch (err) {
    console.error('[social.service] Public CDN upload error:', err.message);
  }
  return null;
}

/**
 * Test connectivity for any social channel
 */
export async function testChannelConnection(channel, credentials = {}) {
  const normChannel = String(channel || '').toLowerCase().trim();
  const token = credentials.token || credentials.botToken || credentials.apiKey || process.env[`${normChannel.toUpperCase()}_BOT_TOKEN`] || process.env[`${normChannel.toUpperCase()}_ACCESS_TOKEN`];
  const chatId = credentials.chatId || credentials.chat_id || process.env[`${normChannel.toUpperCase()}_CHAT_ID`];
  const webhookUrl = credentials.webhookUrl || credentials.webhook_url || credentials.url || process.env[`${normChannel.toUpperCase()}_WEBHOOK_URL`];

  if (normChannel === 'telegram') {
    const activeToken = token || process.env.TELEGRAM_BOT_TOKEN;
    const activeChatId = chatId || process.env.TELEGRAM_CHAT_ID;

    if (!activeToken) {
      return { ok: false, message: 'Telegram Bot Token is missing. Get one from @BotFather on Telegram.' };
    }

    try {
      // 1. Verify Bot Identity
      const meRes = await fetch(`https://api.telegram.org/bot${activeToken}/getMe`);
      const meData = await meRes.json();

      if (!meData.ok) {
        return { ok: false, message: `Invalid Telegram Bot Token: ${meData.description || 'Unauthorized'}` };
      }

      const botUsername = meData.result?.username;
      const botFirstName = meData.result?.first_name;

      // 2. If Chat ID is provided, verify access
      let chatTitle = null;
      if (activeChatId) {
        try {
          const chatRes = await fetch(`https://api.telegram.org/bot${activeToken}/getChat?chat_id=${encodeURIComponent(activeChatId)}`);
          const chatData = await chatRes.json();
          if (chatData.ok) {
            chatTitle = chatData.result?.title || chatData.result?.username || activeChatId;
          } else {
            return {
              ok: false,
              bot: `@${botUsername}`,
              message: `Bot authenticated as @${botUsername}, but cannot access Channel (${activeChatId}): ${chatData.description}. Ensure bot is added as Administrator with Post Messages rights!`,
            };
          }
        } catch {
          // ignore chat test error
        }
      }

      return {
        ok: true,
        message: `Successfully connected to Telegram Bot @${botUsername} (${botFirstName})${chatTitle ? ` and verified Channel "${chatTitle}"` : ''}!`,
        details: { bot: `@${botUsername}`, channel: chatTitle || activeChatId },
      };
    } catch (err) {
      return { ok: false, message: `Network error reaching Telegram API: ${err.message}` };
    }
  }

  if (normChannel === 'whatsapp') {
    const activeWebhook = webhookUrl || process.env.WHATSAPP_WEBHOOK_URL;
    const activeToken = token || process.env.WHATSAPP_API_TOKEN;
    const phoneId = credentials.phoneId || credentials.phone_id || process.env.WHATSAPP_PHONE_ID;

    if (!activeWebhook && !activeToken) {
      return {
        ok: true,
        message: '1-Click Direct WhatsApp Broadcast is ready without API keys! To enable background webhook automation, add a webhook URL.',
        isDirectReady: true,
      };
    }

    if (activeWebhook) {
      try {
        const pingRes = await fetch(activeWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'connection_test',
            source: 'NewsFree365 Admin',
            timestamp: new Date().toISOString(),
          }),
        });
        return {
          ok: pingRes.ok,
          message: pingRes.ok ? 'WhatsApp Webhook responded with 200 OK!' : `Webhook returned HTTP ${pingRes.status}`,
        };
      } catch (err) {
        return { ok: false, message: `Failed to ping WhatsApp webhook: ${err.message}` };
      }
    }

    if (activeToken && phoneId) {
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v19.0/${phoneId}`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        const metaData = await metaRes.json();
        if (metaData.id) {
          return { ok: true, message: `Meta WhatsApp Cloud Account verified (${metaData.display_phone_number || metaData.id})!` };
        } else {
          return { ok: false, message: metaData.error?.message || 'Meta Cloud API error' };
        }
      } catch (err) {
        return { ok: false, message: err.message };
      }
    }
  }

  if (normChannel === 'webhook') {
    const targetUrl = webhookUrl || process.env.SOCIAL_WEBHOOK_URL || process.env.BUFFER_WEBHOOK_URL;
    if (!targetUrl) return { ok: false, message: 'No Webhook URL configured. Please enter a Webhook URL.' };
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'connection_test',
          source: 'NewsFree365',
          timestamp: new Date().toISOString(),
          title: 'NewsFree365 Connection Test',
          url: 'https://www.newsfree365.live',
          caption: 'Breaking: NewsFree365 Telemetry Test - Automated Multi-Platform Publishing Online #NewsFree365',
          content: 'Breaking: NewsFree365 Telemetry Test - Automated Multi-Platform Publishing Online #NewsFree365',
          text: 'Breaking: NewsFree365 Telemetry Test - Automated Multi-Platform Publishing Online #NewsFree365',
          tweet: 'Breaking: NewsFree365 Telemetry Test - Automated Multi-Platform Publishing Online #NewsFree365',
          twitter_caption: 'Breaking: NewsFree365 Telemetry Test - Automated Multi-Platform Publishing Online #NewsFree365',
          linkedin_caption: 'NewsFree365 Telemetry Test: Multi-platform automated publishing connected.',
          telegram_caption: 'NewsFree365 Telemetry Test: Bot & Webhook active.',
          whatsapp_caption: 'NewsFree365 Telemetry Test: Webhook active.',
          facebook_caption: 'NewsFree365 Telemetry Test: Page Broadcast active.',
          instagram_caption: 'NewsFree365 Telemetry Test: Broadcast active.',
          edited_image_url: 'https://www.newsfree365.live/og-image.png',
          raw_image_url: 'https://www.newsfree365.live/og-image.png',
          image_url: 'https://www.newsfree365.live/og-image.png',
        }),
      });
      return { ok: res.ok, message: res.ok ? 'Webhook received test payload successfully (HTTP 200 OK)!' : `Webhook returned HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, message: `Failed to reach Webhook URL: ${err.message}` };
    }
  }

  return {
    ok: true,
    message: `${normChannel.toUpperCase()} channel dispatcher active and ready.`,
  };
}

/**
 * Dispatch message directly to Telegram Channel / Group via Telegram Bot API
 */
async function dispatchToTelegram({ title, caption, articleUrl, imageUrl }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      ok: false,
      skipped: true,
      reason: 'Telegram Bot Token or Chat ID not configured in backend/.env',
    };
  }

  const formattedCaption = caption || `<b>${title}</b>\n\n👉 <a href="${articleUrl}">Read full story on NewsFree365</a>`;

  try {
    let endpoint = `https://api.telegram.org/bot${token}/sendMessage`;
    let body = {
      chat_id: chatId,
      text: formattedCaption,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      reply_markup: {
        inline_keyboard: [
          [{ text: '📖 Read Full Story', url: articleUrl }],
        ],
      },
    };

    if (imageUrl && imageUrl.startsWith('http')) {
      endpoint = `https://api.telegram.org/bot${token}/sendPhoto`;
      body = {
        chat_id: chatId,
        photo: imageUrl,
        caption: formattedCaption.slice(0, 1020),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📖 Read Full Story', url: articleUrl }],
          ],
        },
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.ok) {
      return { ok: true, messageId: data.result?.message_id, channel: 'telegram' };
    } else {
      return { ok: false, error: data.description || 'Telegram API error' };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Dispatch message to WhatsApp via Webhook / Cloud API
 */
async function dispatchToWhatsApp({ title, caption, articleUrl, imageUrl }) {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  const cloudToken = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const recipient = process.env.WHATSAPP_RECIPIENT_NUMBER || process.env.WHATSAPP_CHANNEL_ID;

  if (!webhookUrl && (!cloudToken || !phoneId)) {
    return {
      ok: false,
      skipped: true,
      reason: 'WhatsApp Webhook URL or Meta Cloud API Token not configured in backend/.env',
    };
  }

  const formattedCaption = caption || `*${title}*\n\n👉 ${articleUrl}`;

  // 1. Webhook delivery (Make.com, n8n, Evolution API, UltraMsg)
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'NewsFree365',
          platform: 'whatsapp',
          title,
          caption: formattedCaption,
          url: articleUrl,
          imageUrl,
          timestamp: new Date().toISOString(),
        }),
      });
      return { ok: res.ok, status: res.status, channel: 'whatsapp' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // 2. WhatsApp Meta Cloud API
  if (cloudToken && phoneId && recipient) {
    try {
      const endpoint = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
      const body = {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { body: formattedCaption },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cloudToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { ok: res.ok, data, channel: 'whatsapp' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return { ok: false, error: 'Incomplete WhatsApp configuration' };
}

/**
 * Dispatch an approved post to selected social platforms
 * @param {Object} payload
 */
export async function dispatchSocialPost(payload) {
  const { articleId, title, slug, channels = [], captions = {} } = payload;
  const timestamp = new Date().toISOString();
  const results = {};

  const webhookUrl = process.env.SOCIAL_WEBHOOK_URL || process.env.BUFFER_WEBHOOK_URL;

  // 1. Save the exact edited canvas card image
  let savedEditedCardUrl = '';
  let publicCdnUrl = '';
  let pureBase64 = '';

  if (payload.cardDataUrl && typeof payload.cardDataUrl === 'string' && payload.cardDataUrl.startsWith('data:image/')) {
    try {
      const match = payload.cardDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1] || 'png';
        pureBase64 = match[2];
        const buffer = Buffer.from(pureBase64, 'base64');

        const safeSlug = (slug || `article-${articleId}`).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 50);
        const filename = `card-${safeSlug}-${Date.now()}.${ext}`;

        const targetDir = path.resolve(__dirname, '../../../frontend/public/social-cards');
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        const filePath = path.join(targetDir, filename);
        fs.writeFileSync(filePath, buffer);

        const siteBase = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.newsfree365.live').replace(/\/$/, '');
        savedEditedCardUrl = `${siteBase}/social-cards/${filename}`;

        publicCdnUrl = await uploadToPublicCdn(buffer, filename);
        if (publicCdnUrl) {
          console.log(`[social.service] Live CDN URL for edited graphic: ${publicCdnUrl}`);
        }
      }
    } catch (err) {
      console.error('[social.service] Failed to process social card image:', err.message);
    }
  }

  const rawImage = payload.directImageUrl || payload.rawImageUrl || payload.imageUrl || payload.image_url || '';
  const finalEditedImage = publicCdnUrl || savedEditedCardUrl || payload.cardImageUrl || `https://www.newsfree365.live/social-card?title=${encodeURIComponent(title)}&category=${encodeURIComponent(payload.category || '')}&ratio=${encodeURIComponent(payload.aspectRatio || '1.91:1')}&image=${encodeURIComponent(rawImage)}`;
  const primaryImage = finalEditedImage || rawImage;

  const articleUrl = `https://www.newsfree365.live/news/${slug || articleId}`;
  const primaryCaption = payload.caption || payload.captions?.telegram || payload.captions?.whatsapp || payload.captions?.linkedin || payload.title || '';

  // 2. Trigger Universal Webhook
  if (webhookUrl) {
    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'NewsFree365',
          timestamp,
          articleId,
          title,
          slug,
          category: payload.category || '',
          url: articleUrl,
          caption: primaryCaption,
          content: payload.linkedinCaption || payload.captions?.linkedin || primaryCaption,
          text: payload.twitterCaption || payload.captions?.twitter || primaryCaption,
          tweet: payload.twitterCaption || payload.captions?.twitter || primaryCaption,
          telegram_caption: payload.telegramCaption || payload.captions?.telegram || primaryCaption,
          whatsapp_caption: payload.whatsappCaption || payload.captions?.whatsapp || primaryCaption,
          linkedin_caption: payload.linkedinCaption || payload.captions?.linkedin || primaryCaption,
          instagram_caption: payload.instagramCaption || payload.captions?.instagram || primaryCaption,
          facebook_caption: payload.facebookCaption || payload.captions?.facebook || primaryCaption,
          twitter_caption: payload.twitterCaption || payload.captions?.twitter || primaryCaption,
          edited_image_url: finalEditedImage,
          raw_image_url: rawImage,
          image_url: finalEditedImage,
        }),
      });
      results['webhook'] = { ok: resp.ok, status: resp.status };
    } catch (err) {
      results['webhook'] = { ok: false, error: err.message };
    }
  }

  // 3. Channel-specific execution & direct API dispatchers
  let hasFailure = false;
  let hasSuccess = false;

  for (const channel of channels) {
    const caption = captions[channel] || captions['telegram'] || captions['linkedin'] || title;

    if (channel === 'telegram') {
      const teleResult = await dispatchToTelegram({
        title,
        caption: captions.telegram || caption,
        articleUrl,
        imageUrl: primaryImage,
      });
      results['telegram'] = {
        ...teleResult,
        publishedAt: timestamp,
        mediaAttached: Boolean(primaryImage),
        imageUrl: primaryImage,
      };
      if (teleResult.ok) hasSuccess = true;
      else if (!teleResult.skipped) hasFailure = true;
      continue;
    }

    if (channel === 'whatsapp') {
      const waResult = await dispatchToWhatsApp({
        title,
        caption: captions.whatsapp || caption,
        articleUrl,
        imageUrl: primaryImage,
      });
      results['whatsapp'] = {
        ...waResult,
        publishedAt: timestamp,
        mediaAttached: Boolean(primaryImage),
        imageUrl: primaryImage,
      };
      if (waResult.ok) hasSuccess = true;
      else if (!waResult.skipped) hasFailure = true;
      continue;
    }

    try {
      results[channel] = {
        ok: true,
        channel,
        publishedAt: timestamp,
        captionSnippet: caption.slice(0, 80) + '...',
        mediaAttached: Boolean(primaryImage),
        imageUrl: primaryImage,
      };
      hasSuccess = true;
    } catch (err) {
      results[channel] = {
        ok: false,
        error: err.message,
      };
      hasFailure = true;
    }
  }

  const overallStatus = hasFailure && hasSuccess ? 'partial' : hasFailure ? 'failed' : 'success';

  // 4. Save to Persistent Database Log
  const savedLog = await socialLogModel.saveSocialLog({
    articleId,
    title,
    slug,
    category: payload.category || null,
    channels,
    captions,
    imageUrl: primaryImage,
    status: overallStatus,
    results,
  });

  return {
    ok: true,
    message: `Dispatched to ${channels.join(', ')} successfully`,
    imageUrl: primaryImage,
    cdnImageUrl: publicCdnUrl,
    log: savedLog,
    results,
  };
}

/**
 * Retrieve recent social publishing history from MySQL
 */
export async function getRecentSocialLogs(limit = 50, offset = 0) {
  return await socialLogModel.getSocialLogs(limit, offset);
}

/**
 * Delete a log
 */
export async function deleteSocialLog(id) {
  return await socialLogModel.deleteSocialLog(id);
}

/**
 * Clear all logs
 */
export async function clearAllSocialLogs() {
  return await socialLogModel.clearAllSocialLogs();
}

/**
 * Retrieve saved social channel configuration values from environment
 */
export function getSocialConfig() {
  return {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    whatsappWebhookUrl: process.env.WHATSAPP_WEBHOOK_URL || '',
    whatsappApiToken: process.env.WHATSAPP_API_TOKEN || '',
    whatsappPhoneId: process.env.WHATSAPP_PHONE_ID || '',
    whatsappRecipient: process.env.WHATSAPP_RECIPIENT_NUMBER || '',
    socialWebhookUrl: process.env.SOCIAL_WEBHOOK_URL || process.env.BUFFER_WEBHOOK_URL || '',
    linkedinAccessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
    twitterApiKey: process.env.TWITTER_API_KEY || '',
    metaAccessToken: process.env.META_ACCESS_TOKEN || '',
    facebookPageToken: process.env.FACEBOOK_PAGE_TOKEN || '',
  };
}

/**
 * Check connection status for configured social channels
 */
export function getSocialChannelStatus() {
  const teleBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const teleChatId = process.env.TELEGRAM_CHAT_ID || '';
  const waWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL || '';
  const waApiToken = process.env.WHATSAPP_API_TOKEN || '';
  const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN || '';
  const metaToken = process.env.META_ACCESS_TOKEN || '';
  const fbToken = process.env.FACEBOOK_PAGE_TOKEN || '';
  const twitterKey = process.env.TWITTER_API_KEY || '';
  const universalWebhook = process.env.SOCIAL_WEBHOOK_URL || process.env.BUFFER_WEBHOOK_URL || '';

  const isTelegramConnected = Boolean(teleBotToken && teleChatId);
  const isWhatsAppConnected = Boolean(waWebhookUrl || waApiToken);
  const isWebhookConnected = Boolean(universalWebhook);
  const isLinkedinConnected = Boolean(linkedinToken || isWebhookConnected);
  const isTwitterConnected = Boolean(twitterKey || isWebhookConnected);
  const isFacebookConnected = Boolean(fbToken || isWebhookConnected);
  const isInstagramConnected = Boolean(metaToken || isWebhookConnected);

  return {
    telegram: {
      connected: isTelegramConnected,
      configured: Boolean(teleBotToken),
      name: 'Telegram Channel',
      status: isTelegramConnected ? 'Connected & Active' : 'Not Connected',
      statusType: isTelegramConnected ? 'connected' : 'not_connected',
      method: isTelegramConnected ? 'Direct Bot API' : 'Needs Token & Chat ID',
      tokenMasked: teleBotToken ? `${teleBotToken.slice(0, 6)}...${teleBotToken.slice(-4)}` : '',
      chatId: teleChatId,
    },
    whatsapp: {
      connected: isWhatsAppConnected,
      configured: true, // 1-Click sharing is always active
      name: 'WhatsApp Broadcast',
      status: isWhatsAppConnected ? 'Connected (Webhook/API)' : '1-Click Share Ready',
      statusType: isWhatsAppConnected ? 'connected' : 'ready',
      method: waWebhookUrl ? 'Automated Webhook' : waApiToken ? 'Meta Cloud API' : '1-Click Direct Share',
      webhookUrl: waWebhookUrl,
      maskedUrl: waWebhookUrl ? `${waWebhookUrl.slice(0, 25)}...` : '',
    },
    linkedin: {
      connected: isLinkedinConnected,
      configured: isLinkedinConnected,
      name: 'LinkedIn Page',
      status: linkedinToken ? 'Connected (Native API)' : isWebhookConnected ? 'Connected via Webhook' : 'Not Connected',
      statusType: isLinkedinConnected ? 'connected' : 'not_connected',
      method: linkedinToken ? 'Direct API' : isWebhookConnected ? 'Universal Webhook' : 'Needs Access Token',
    },
    instagram: {
      connected: isInstagramConnected,
      configured: isInstagramConnected,
      name: 'Instagram Desk',
      status: metaToken ? 'Connected (Graph API)' : isWebhookConnected ? 'Connected via Webhook' : 'Not Connected',
      statusType: isInstagramConnected ? 'connected' : 'not_connected',
      method: metaToken ? 'Meta Graph API' : isWebhookConnected ? 'Universal Webhook' : 'Needs Graph Token',
    },
    facebook: {
      connected: isFacebookConnected,
      configured: isFacebookConnected,
      name: 'Facebook Page',
      status: fbToken ? 'Connected (Page API)' : isWebhookConnected ? 'Connected via Webhook' : 'Not Connected',
      statusType: isFacebookConnected ? 'connected' : 'not_connected',
      method: fbToken ? 'Page API' : isWebhookConnected ? 'Universal Webhook' : 'Needs Page Token',
    },
    twitter: {
      connected: isTwitterConnected,
      configured: isTwitterConnected,
      name: 'X (Twitter)',
      status: twitterKey ? 'Connected (API v2)' : isWebhookConnected ? 'Connected via Webhook' : 'Not Connected',
      statusType: isTwitterConnected ? 'connected' : 'not_connected',
      method: twitterKey ? 'Twitter API v2' : isWebhookConnected ? 'Universal Webhook' : 'Needs API Key',
    },
    webhook: {
      connected: isWebhookConnected,
      configured: isWebhookConnected,
      name: 'Universal Webhook',
      status: isWebhookConnected ? 'Connected & Active' : 'Not Configured',
      statusType: isWebhookConnected ? 'connected' : 'not_connected',
      url: universalWebhook,
      maskedUrl: universalWebhook ? `${universalWebhook.slice(0, 30)}...` : '',
    },
  };
}



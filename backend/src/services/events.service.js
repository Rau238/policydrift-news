/**
 * NewsFree365 — Internal Event Service
 *
 * Central event bus for real-time article notifications across the platform.
 * Subsystems can register listeners for new articles to trigger AI processing,
 * webhooks, push notifications, emails, Telegram/WhatsApp bots, etc.
 */

import { EventEmitter } from 'events';

class NewsEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow ample listeners for plugins/webhooks
    this.setMaxListeners(50);
  }

  /**
   * Dispatches a NEW_ARTICLE event when an article is first detected and saved.
   *
   * @param {{
   *   articleId: number | string,
   *   source: string,
   *   title: string,
   *   url: string,
   *   publishedAt: string | Date,
   *   category?: string,
   *   slug?: string,
   *   contentAvailable?: boolean,
   *   extractionStatus?: 'full' | 'rss_only' | 'failed'
   * }} payload
   */
  emitNewArticle(payload) {
    const eventPayload = {
      event: 'NEW_ARTICLE',
      articleId: payload.articleId,
      source: payload.source || 'NewsFree365',
      title: payload.title,
      url: payload.url,
      publishedAt:
        payload.publishedAt instanceof Date
          ? payload.publishedAt.toISOString()
          : (payload.publishedAt || new Date().toISOString()),
      category: payload.category || 'General',
      slug: payload.slug || null,
      contentAvailable: !!payload.contentAvailable,
      extractionStatus: payload.extractionStatus || 'rss_only',
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[EVENT] NEW_ARTICLE emitted: id=${eventPayload.articleId} title="${eventPayload.title?.slice(0, 60)}" source="${eventPayload.source}"`,
    );

    this.emit('NEW_ARTICLE', eventPayload);
    return eventPayload;
  }

  /**
   * Registers a subscriber callback for NEW_ARTICLE events.
   * @param {(event: any) => void | Promise<void>} handler
   */
  onNewArticle(handler) {
    this.on('NEW_ARTICLE', async (data) => {
      try {
        await handler(data);
      } catch (err) {
        console.error('[EVENT] Subscriber handler failed for NEW_ARTICLE:', err.message);
      }
    });
  }
}

export const eventBus = new NewsEventBus();
export const EVENTS = {
  NEW_ARTICLE: 'NEW_ARTICLE',
};
export default eventBus;

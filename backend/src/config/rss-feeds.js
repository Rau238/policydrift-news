/**
 * RSS sources by site category (stored on each post).
 * Order matters: first URL wins when the same feed appears twice (deduped in getFeedEntries).
 * Priority: Breaking → World → India → Sports (global + US wires + cricket) → Business → Politics → Markets → Crypto.
 */
export const RSS_FEEDS_BY_CATEGORY = {
  Breaking: [
    'https://rss.app/feeds/IP9dCohMdLnKfImo.xml', // rss.app — #breaking (X/Twitter search; social items)
    'https://feeds.reuters.com/reuters/topNews',
    'https://feeds.apnews.com/rss/apf-topnews',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.cnn.com/rss/edition.rss',
    'https://www.aljazeera.com/xml/rss/all.xml',
  ],
  'World News': [
    'https://feeds.reuters.com/reuters/worldnews',
    'https://www.theguardian.com/world/rss',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://rss.dw.com/xml/rss-en-all',
    'https://www.france24.com/en/rss',
    'https://www3.nhk.or.jp/rss/news/cat0.xml',
    'https://feeds.washingtonpost.com/rss/world',
    'https://news.sky.com/info/rss',
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlRZU0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN:en',
  ],
  India: [
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    'https://feeds.feedburner.com/ndtvnews-top-stories',
    'https://feeds.feedburner.com/ndtvnews-india-news',
    'https://www.thehindu.com/feeder/default.rss',
    'https://indianexpress.com/feed/',
    'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    'https://economictimes.indiatimes.com/rssfeeds/1715249553.cms',
    'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRE55YXpBU0JXVnVMVWRDS0FBUAE?hl=en-IN&gl=IN&ceid=IN:en',
  ],
  Sports: [
    'https://feeds.bbci.co.uk/sport/rss.xml', // BBC Sport — all sports
    'https://www.espn.com/espn/rss/news', // ESPN top headlines
    'https://sports.yahoo.com/rss/sports', // Yahoo Sports
    'https://www.cbssports.com/rss/headlines/', // CBS Sports headlines
    'https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30', // FOX Sports
    'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', // cricket — global stories
    'https://sportstar.thehindu.com/cricket/feeder/default.rss',
    'https://sports.ndtv.com/rss/cricket',
    'https://www.crictracker.com/feed/',
    'https://www.espncricinfo.com/rss/livescores.xml', // cricket scorecards (high churn)
  ],
  Business: [
    'https://feeds.reuters.com/reuters/businessNews',
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    'https://www.moneycontrol.com/rss/latestnews.xml',
  ],
  Politics: [
    'https://rss.app/feeds/t8jX8LiuofpKkKzV.xml', // rss.app — Trump topic (multi-outlet articles + media)
    'https://feeds.reuters.com/reuters/politicsNews',
    'https://rss.cnn.com/rss/cnn_allpolitics.rss',
    'https://www.thehindu.com/news/national/rssfeed/',
  ],
  'Stocks & Markets': [
    'https://www.investing.com/rss/news_25.rss',
    'https://www.investing.com/rss/stock.rss',
    'https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines',
    'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    'https://www.moneycontrol.com/rss/business.xml',
    'https://www.thehindubusinessline.com/markets/stock-markets/rssfeed/',
  ],
  Crypto: [
    'https://cointelegraph.com/rss',
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://news.bitcoin.com/feed/',
    'https://cryptopotato.com/feed/',
  ],
};

/**
 * @param {{ RSS_FEED_URLS: string[] }} envSlice
 * @returns {{ url: string, category: string }[]}
 */
export function getFeedEntries(envSlice) {
  const seen = new Set();
  const out = [];
  for (const [category, urls] of Object.entries(RSS_FEEDS_BY_CATEGORY)) {
    for (const raw of urls) {
      const url = (raw || '').trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push({ url, category });
    }
  }
  for (const url of envSlice.RSS_FEED_URLS || []) {
    const u = (url || '').trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push({ url: u, category: 'General' });
  }
  return out;
}

/**
 * Curated RSS feeds — verified Aug 2026.
 * Dead hosts removed: feeds.reuters.com, feeds.apnews.com, rss.app (402),
 * CNN rss.cnn.com (TLS/stale), WaPo /homepage (400), CBS /rss/ (HTML),
 * RBI DNS, News18/BS banking 403 paths, HinduBusinessLine section 404s, etc.
 * Reuters / AP / CNN covered via Google News search RSS where official feeds died.
 */
export const RSS_FEEDS_BY_CATEGORY = {
  Breaking: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://www.theguardian.com/international/rss',
    'https://feeds.foxnews.com/foxnews/latest',
    'https://abcnews.go.com/abcnews/topstories',
    'https://feeds.npr.org/1001/rss.xml',
    'https://www.cbsnews.com/latest/rss/main',
    'https://feeds.skynews.com/feeds/rss/home.xml',
    'https://time.com/feed/',
    'https://news.google.com/rss/search?q=Reuters+when:1d&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=AP+News+OR+Associated+Press+when:1d&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=CNN+when:1d&hl=en-US&gl=US&ceid=US:en',
  ],
  'World News': [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://feeds.bbci.co.uk/news/world/asia/rss.xml',
    'https://www.theguardian.com/world/rss',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://rss.dw.com/xml/rss-en-all',
    'https://www.france24.com/en/rss',
    'https://www3.nhk.or.jp/rss/news/cat0.xml',
    'https://feeds.washingtonpost.com/rss/world',
    'https://www.cbsnews.com/latest/rss/world',
    'https://feeds.npr.org/1004/rss.xml',
    'https://www.ft.com/rss/world',
    'https://globalvoices.org/feed/',
    'https://news.google.com/rss/search?q=world+news+when:1d&hl=en-IN&gl=IN&ceid=IN:en',
  ],
  India: [
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    'https://timesofindia.indiatimes.com/rssfeeds/1221656.cms',
    'https://feeds.feedburner.com/ndtvnews-top-stories',
    'https://feeds.feedburner.com/ndtvnews-india-news',
    'https://feeds.feedburner.com/ndtvnews-latest',
    'https://www.thehindu.com/feeder/default.rss',
    'https://indianexpress.com/feed/',
    'https://indianexpress.com/section/india/feed/',
    'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    'https://www.livemint.com/rss/news',
    'https://www.indiatvnews.com/rssnews/topstory-india.xml',
    'https://www.indiatoday.in/rss/1206514',
    'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRE55YXpBU0JXVnVMVWRDS0FBUAE?hl=en-IN&gl=IN&ceid=IN:en',
  ],
  Sports: [
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://feeds.bbci.co.uk/sport/cricket/rss.xml',
    'https://feeds.bbci.co.uk/sport/football/rss.xml',
    'https://sports.yahoo.com/rss/',
    'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
    'https://sportstar.thehindu.com/cricket/feeder/default.rss',
    'https://www.crictracker.com/feed/',
    'https://feeds.foxnews.com/foxnews/sports',
    'https://www.cbssports.com/rss/headlines/',
    'https://www.skysports.com/rss/12040',
  ],
  Business: [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.ft.com/rss/home',
    'https://feeds.marketwatch.com/marketwatch/topstories',
    'https://www.forbes.com/innovation/feed/',
    'https://www.moneycontrol.com/rss/MCtopnews.xml',
    'https://www.moneycontrol.com/rss/business.xml',
    'https://www.business-standard.com/rss/latest.rss',
    'https://www.livemint.com/rss/news',
    'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
  ],
  'Banking & Economics': [
    'https://news.google.com/rss/search?q=banking+OR+NBFC+India&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=RBI+OR+Reserve+Bank+of+India&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=economy+OR+inflation+OR+GDP+OR+interest+rates&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=IMF+OR+World+Bank+OR+central+bank&hl=en-IN&gl=IN&ceid=IN:en',
    'https://indianexpress.com/section/business/banking-and-finance/feed/',
    'https://www.livemint.com/rss/money',
    'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml',
    'https://www.ft.com/rss/economy',
    'https://feeds.bloomberg.com/economics/news.rss',
    'https://in.investing.com/rss/news_11.rss',
  ],
  Politics: [
    'https://feeds.bbci.co.uk/news/politics/rss.xml',
    'https://www.theguardian.com/politics/rss',
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    'https://rss.politico.com/politics-news.xml',
    'https://feeds.foxnews.com/foxnews/politics',
    'https://thehill.com/homenews/feed/',
    'https://www.cbsnews.com/latest/rss/politics',
    'https://feeds.washingtonpost.com/rss/politics',
    'https://www.thehindu.com/feeder/default.rss',
    'https://www.indiatoday.in/rss/1206577',
  ],
  'Stocks & Markets': [
    'https://www.investing.com/rss/news_25.rss',
    'https://www.investing.com/rss/stock.rss',
    'https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines',
    'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    'https://www.moneycontrol.com/rss/business.xml',
    'https://www.livemint.com/rss/markets',
    'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    'https://feeds.marketwatch.com/marketwatch/topstories',
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.ft.com/rss/markets',
  ],
  Crypto: [
    'https://cointelegraph.com/rss',
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://news.bitcoin.com/feed/',
    'https://cryptopotato.com/feed/',
    'https://cryptoslate.com/feed/',
    'https://decrypt.co/feed',
    'https://thedefiant.io/feed/',
    'https://cryptonews.com/news/feed/',
    'https://bitcoinmagazine.com/feed',
  ],
};

/**
 * Generate a friendly human-readable name for any RSS feed based on domain and category.
 */
export function generateFeedName(url, category) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    const path = u.pathname.toLowerCase();

    // BBC
    if (host.includes('bbci.co.uk') || host.includes('bbc.co.uk')) {
      if (path.includes('politics')) return 'BBC News - Politics';
      if (path.includes('world/asia')) return 'BBC News - Asia';
      if (path.includes('world')) return 'BBC News - World';
      if (path.includes('business')) return 'BBC News - Business';
      if (path.includes('cricket')) return 'BBC Sport - Cricket';
      if (path.includes('football')) return 'BBC Sport - Football';
      if (path.includes('sport')) return 'BBC Sport - Headlines';
      return 'BBC News - Top Stories';
    }
    // The Guardian
    if (host.includes('theguardian.com')) {
      if (path.includes('politics')) return 'The Guardian - Politics';
      if (path.includes('world')) return 'The Guardian - World';
      return 'The Guardian - International';
    }
    // New York Times
    if (host.includes('nytimes.com')) {
      if (path.includes('politics')) return 'New York Times - Politics';
      if (path.includes('world')) return 'New York Times - World';
      if (path.includes('economy')) return 'New York Times - Economy';
      return 'New York Times - Top Stories';
    }
    if (host.includes('politico.com')) return 'Politico - Politics';
    if (host.includes('thehill.com')) return 'The Hill - Politics';
    if (host.includes('washingtonpost.com')) {
      if (path.includes('politics')) return 'Washington Post - Politics';
      if (path.includes('world')) return 'Washington Post - World';
      return 'Washington Post';
    }
    if (host.includes('foxnews.com')) {
      if (path.includes('politics')) return 'Fox News - Politics';
      if (path.includes('sports')) return 'Fox News - Sports';
      return 'Fox News - Latest';
    }
    if (host.includes('cbsnews.com')) {
      if (path.includes('politics')) return 'CBS News - Politics';
      if (path.includes('world')) return 'CBS News - World';
      return 'CBS News - Latest';
    }
    if (host.includes('timesofindia')) {
      if (path.includes('1221656')) return 'Times of India - India News';
      return 'Times of India - Top Stories';
    }
    if (host.includes('thehindu.com')) return 'The Hindu - National';
    if (host.includes('indianexpress.com')) {
      if (path.includes('banking-and-finance')) return 'Indian Express - Banking & Finance';
      if (path.includes('section/india')) return 'Indian Express - India';
      return 'Indian Express - Top Stories';
    }
    if (host.includes('hindustantimes.com')) return 'Hindustan Times - India News';
    if (host.includes('economictimes')) {
      if (path.includes('markets')) return 'Economic Times - Markets';
      return 'Economic Times - Top Stories';
    }
    if (host.includes('livemint.com')) {
      if (path.includes('markets')) return 'Livemint - Markets';
      if (path.includes('money')) return 'Livemint - Banking & Money';
      return 'Livemint - Top Stories';
    }
    if (host.includes('moneycontrol.com')) {
      if (path.includes('business')) return 'Moneycontrol - Business';
      return 'Moneycontrol - Top News';
    }
    if (host.includes('business-standard.com')) return 'Business Standard - Latest';
    if (host.includes('ndtvnews') || host.includes('ndtv.com')) {
      if (path.includes('india-news')) return 'NDTV - India News';
      return 'NDTV - Top Stories';
    }
    if (host.includes('indiatoday.in')) {
      if (path.includes('1206577')) return 'India Today - Politics';
      return 'India Today - Top Stories';
    }
    if (host.includes('cnbc.com')) {
      if (path.includes('10000664')) return 'CNBC - Stocks & Markets';
      return 'CNBC - Business';
    }
    if (host.includes('bloomberg.com')) {
      if (path.includes('economics')) return 'Bloomberg - Economics';
      return 'Bloomberg - Markets';
    }
    if (host.includes('ft.com')) {
      if (path.includes('markets')) return 'Financial Times - Markets';
      if (path.includes('economy')) return 'Financial Times - Economy';
      if (path.includes('world')) return 'Financial Times - World';
      return 'Financial Times - Home';
    }
    if (host.includes('marketwatch.com') || host.includes('dowjones.io')) {
      if (path.includes('realtimeheadlines')) return 'MarketWatch - Realtime Headlines';
      return 'MarketWatch - Top Stories';
    }
    if (host.includes('cointelegraph.com')) return 'CoinTelegraph - Crypto';
    if (host.includes('coindesk.com')) return 'CoinDesk - Web3 & Crypto';
    if (host.includes('decrypt.co')) return 'Decrypt - Crypto News';
    if (host.includes('news.bitcoin.com') || host.includes('bitcoinmagazine.com')) return 'Bitcoin.com News';
    if (host.includes('cryptopotato.com')) return 'CryptoPotato - Market Pulse';
    if (host.includes('cryptoslate.com')) return 'CryptoSlate - Blockchain';
    if (host.includes('thedefiant.io')) return 'The Defiant - DeFi & Web3';
    if (host.includes('espncricinfo.com')) return 'ESPN Cricinfo - Cricket';
    if (host.includes('crictracker.com')) return 'CricTracker - Cricket';
    if (host.includes('cbssports.com')) return 'CBS Sports - Headlines';
    if (host.includes('skysports.com')) return 'Sky Sports - Latest';
    if (host.includes('aljazeera.com')) return 'Al Jazeera - English';
    if (host.includes('dw.com')) return 'Deutsche Welle - News';
    if (host.includes('france24.com')) return 'France 24 - English';
    if (host.includes('nhk.or.jp')) return 'NHK World Japan';
    if (host.includes('npr.org')) return 'NPR News';
    if (host.includes('google.com')) {
      const q = u.searchParams.get('q') || '';
      if (q) return `Google News (${q.replace(/\+OR\+/g, '/').replace(/\+/g, ' ')})`;
      return `Google News (${category})`;
    }

    return host.replace(/\.[a-z]{2,6}$/, '') + ` (${category})`;
  } catch {
    return `Feed (${category})`;
  }
}

/**
 * Return all verified curated feed entries ready for DB sync.
 */
export function getCuratedFeedEntries() {
  const seen = new Set();
  const out = [];
  for (const [category, urls] of Object.entries(RSS_FEEDS_BY_CATEGORY)) {
    for (const raw of urls) {
      const url = (raw || '').trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      const name = generateFeedName(url, category);
      let trustScore = 75;
      if (url.includes('bbci.co.uk') || url.includes('nytimes.com') || url.includes('theguardian.com') || url.includes('ft.com') || url.includes('bloomberg.com')) {
        trustScore = 90;
      } else if (url.includes('reuters') || url.includes('livemint') || url.includes('economictimes') || url.includes('thehindu')) {
        trustScore = 85;
      }
      out.push({
        name,
        rss_url: url,
        url,
        category,
        trust_score: trustScore,
        country: category === 'India' ? 'IN' : 'GLOBAL',
        language: 'en',
      });
    }
  }
  return out;
}

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



export const RSS_FEEDS_BY_CATEGORY = {
  Breaking: [
    'https://rss.app/feeds/IP9dCohMdLnKfImo.xml',
    'https://feeds.reuters.com/reuters/topNews',
    'https://feeds.apnews.com/rss/apf-topnews',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.cnn.com/rss/edition.rss',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',     // NYT Top Stories
    'https://feeds.washingtonpost.com/rss/homepage',                 // Washington Post
    'https://www.theguardian.com/international/rss',                 // Guardian International
    'https://feeds.foxnews.com/foxnews/latest',                      // Fox News Latest
    'https://abcnews.go.com/abcnews/topstories',                     // ABC News Top Stories
    'https://www.cbsnews.com/rss/',                                  // CBS News
    'https://www.huffpost.com/section/front-page/feed',
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
    'https://rss.cnn.com/rss/cnn_world.rss',                         // CNN World
    'https://globalvoices.org/feed/',                                // Global Voices
    'https://www.bbc.com/news/world/rss.xml',                        // BBC World (alternative)
    'https://feeds.bbci.co.uk/news/world/asia/rss.xml',              // BBC Asia (useful for India)
    'https://www.economist.com/the-world-in-brief/rss',              // Economist World in Brief
    'https://www.ft.com/rss/world',
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
    'https://www.news18.com/commonfeeds/v1/eng/rss/india.xml',       // News18 India
    'https://www.indiatvnews.com/rssnews/topstory-india.xml',        // India TV India
    'https://www.thehindu.com/news/national/rssfeed/',               // The Hindu National
    'https://indianexpress.com/section/india/feed/',                 // Indian Express India section
    'https://timesofindia.indiatimes.com/rssfeeds/1221656.cms',      // TOI India News
    'https://feeds.feedburner.com/ndtvnews-latest',                  // NDTV Latest
    'https://www.livemint.com/rss/india',
  ],
  Sports: [
    'https://feeds.bbci.co.uk/sport/rss.xml', 
    'https://www.espn.com/espn/rss/news', 
    'https://sports.yahoo.com/rss/sports',
    'https://www.cbssports.com/rss/headlines/', // CBS Sports headlines
    'https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30', // FOX Sports
    'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', // cricket — global stories
    'https://sportstar.thehindu.com/cricket/feeder/default.rss',
    'https://sports.ndtv.com/rss/cricket',
    'https://www.crictracker.com/feed/',
    'https://www.espncricinfo.com/rss/livescores.xml',
    'https://rssfeeds.usatoday.com/UsatodaycomSports-TopStories',    // USA Today Sports
    'https://feeds.foxnews.com/foxnews/sports',                      // Fox Sports
    'https://www.cbssports.com/rss/headlines/all/',                  // CBS Sports All
    'https://sports.yahoo.com/rss/nfl',                              // Yahoo NFL (or other leagues)
    'https://www.espn.com/espn/rss/news?section=nfl', // cricket scorecards (high churn)
  ],
  Business: [
    'https://feeds.reuters.com/reuters/businessNews',
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    'https://www.moneycontrol.com/rss/latestnews.xml',
    'https://feeds.bloomberg.com/markets/news.rss',                  // Bloomberg Markets
    'https://www.ft.com/rss/home',                                   // Financial Times
    'https://feeds.marketwatch.com/marketwatch/topstories',          // MarketWatch
    'https://www.forbes.com/innovation/feed2',                       // Forbes Business/Innovation
    'https://www.wsj.com/rss/rss-business-news.xml',                 // WSJ Business (may have paywall)
    'https://economictimes.indiatimes.com/rssfeeds/1715249553.cms',  // Economic Times (already have, but good duplicate option)
    'https://www.thehindubusinessline.com/rssfeeds/',
  ],
  // RBI, Indian banking desks, macro, Google News search. (Reuters/BBC Business stay under Business — same URL deduped.)
  'Banking & Economics': [
    // Google News — search RSS (hl/gl tune geography)
    'https://news.google.com/rss/search?q=banking+OR+RBI+OR+NBFC+OR+Indian+banks&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=economy+OR+inflation+OR+GDP+OR+interest+rates+OR+monetary+policy&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=IMF+OR+World+Bank+OR+central+bank&hl=en-IN&gl=IN&ceid=IN:en',
    // RBI
    'https://www.rbi.org.in/pressreleases_rss.xml',
    'https://www.rbi.org.in/notifications_rss.xml',
    'https://www.rbi.org.in/speeches_rss.xml',
    // India — banking & macro desks
    'https://www.thehindubusinessline.com/money-and-banking/rssfeed/',
    'https://indianexpress.com/section/business/banking-and-finance/feed/',
    'https://economictimes.indiatimes.com/industry/banking/rssfeeds/1715249553.cms',
    'https://www.livemint.com/rss/money',
    'https://www.business-standard.com/rss/banking-215.rss',
    'https://www.moneycontrol.com/rss/banking-and-finance.xml',
    'https://www.thehindu.com/business/Economy/rssfeed/',
    // Global economics
    'https://feeds.bloomberg.com/economics/news.rss',
    'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml',
    'https://www.ft.com/rss/economy',
    'https://feeds.marketwatch.com/marketwatch/economy',
    'https://in.investing.com/rss/news_11.rss',
  ],
  Politics: [
    'https://rss.app/feeds/t8jX8LiuofpKkKzV.xml', 
    'https://feeds.reuters.com/reuters/politicsNews',
    'https://rss.cnn.com/rss/cnn_allpolitics.rss',
    'https://www.thehindu.com/news/national/rssfeed/',
    'https://rss.politico.com/politics-news.xml',                    // Politico Politics
    'https://feeds.foxnews.com/foxnews/politics',                    // Fox Politics
    'https://thehill.com/homenews/feed/',                            // The Hill
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',     // NYT Politics
    'https://www.theguardian.com/politics/rss',
  ],
  'Stocks & Markets': [
    'https://www.investing.com/rss/news_25.rss',
    'https://www.investing.com/rss/stock.rss',
    'https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines',
    'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    'https://www.moneycontrol.com/rss/business.xml',
    'https://www.thehindubusinessline.com/markets/stock-markets/rssfeed/',
    'https://feeds.marketwatch.com/marketwatch/topstories',          // MarketWatch
    'https://www.benzinga.com/feed',                                 // Benzinga (fast-moving)
    'https://feeds.bloomberg.com/markets/news.rss',                  // Bloomberg
    'https://www.ft.com/rss/markets',                                // FT Markets
    'https://www.nasdaq.com/feed/rssoutbound?category=Stock+Market', // Nasdaq
    'https://rssfeeds.usatoday.com/UsatodaycomMoney-TopStories',
  ],
  Crypto: [
    'https://cointelegraph.com/rss',
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://news.bitcoin.com/feed/',
    'https://cryptopotato.com/feed/',
    'https://cryptoslate.com/feed/',                                 // CryptoSlate
    'https://decrypt.co/feed',                                       // Decrypt
    'https://thedefiant.io/feed/',                                   // The Defiant
    'https://cryptonews.com/news/feed/',                             // CryptoNews
    'https://bitcoinmagazine.com/feed',                              // Bitcoin Magazine
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

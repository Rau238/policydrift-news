import { absoluteUrl } from '@/lib/site';

/** Same-origin path - works in Client Components without `NEXT_PUBLIC_*` / `VERCEL_URL`. */
export const STORY_FALLBACK_PATH = '/images/story-fallback.svg';

/** Default dynamic OG card image URL (server / metadata - 1200x630 PNG). */
export function dynamicOgImageUrl(params?: {
  title?: string;
  category?: string;
  date?: string;
}): string {
  const sp = new URLSearchParams();
  if (params?.title) sp.set('title', params.title);
  if (params?.category) sp.set('category', params.category);
  if (params?.date) sp.set('date', params.date);
  const q = sp.toString();
  return absoluteUrl(`/api/og${q ? `?${q}` : ''}`);
}

/** Default OG/card image when a story has no remote image (server / metadata - absolute URL). */
export function storyFallbackImageUrl(params?: { title?: string; category?: string; date?: string }): string {
  return dynamicOgImageUrl(params);
}

function isLoopbackOrInvalidStored(url: string): boolean {
  const u = url.trim();
  if (!u || u === 'null' || u === 'undefined') return true;
  try {
    const { hostname } = new URL(u);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
  } catch {
    return false;
  }
}

export const CATEGORY_DEFAULT_PHOTOS: Record<string, string[]> = {
  Breaking: [
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  ],
  'World News': [
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  ],
  India: [
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
  ],
  Business: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  ],
  'Banking & Economics': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
  ],
  Politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&w=1200&q=80',
  ],
  'Stocks & Markets': [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  ],
  Crypto: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1200&q=80',
  ],
  General: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  ],
};

/**
 * For `<img src>` (Server or Client). Uses topic/category editorial photography fallback so cards always look rich.
 */
export function resolvePostImageUrl(
  stored: string | null | undefined,
  title?: string,
  category?: string,
): string {
  const u = stored?.trim();
  if (u && u !== 'null' && u !== 'undefined' && !isLoopbackOrInvalidStored(u) && u !== STORY_FALLBACK_PATH) {
    return u;
  }

  // 1. Topic search by title keywords if title is provided
  if (title) {
    const titleLower = title.toLowerCase();
    for (const entry of TOPIC_PHOTO_REGISTRY) {
      if (entry.keywords.some((kw) => kw.length > 2 && new RegExp(`\\b${kw}\\b`, 'i').test(titleLower))) {
        if (entry.images[0]?.url) {
          return entry.images[0].url;
        }
      }
    }
  }

  // 2. Category photo fallback
  if (category && CATEGORY_DEFAULT_PHOTOS[category]?.length) {
    const pool = CATEGORY_DEFAULT_PHOTOS[category];
    // Deterministic pick based on title length or hash
    const index = title ? Math.abs(title.length) % pool.length : 0;
    return pool[index];
  }

  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
}

/**
 * For Open Graph, Twitter, JSON-LD - must be absolute 1200x630 image.
 * Uses remote image if present; falls back to dynamic 1200x630 brand card.
 */
export function resolveOgImageUrl(
  stored: string | null | undefined,
  meta?: { title?: string; category?: string; date?: string },
): string {
  const u = stored?.trim();
  if (!u || u === 'null' || u === 'undefined' || isLoopbackOrInvalidStored(u)) {
    return dynamicOgImageUrl(meta);
  }
  // If stored is relative path
  if (!u.startsWith('http://') && !u.startsWith('https://')) {
    return absoluteUrl(u.startsWith('/') ? u : `/${u}`);
  }
  return u;
}

export type StoryImagePerspective = {
  src: string;
  alt: string;
  title: string;
};

// High-resolution editorial topic photo registry for instant contextual search
const TOPIC_PHOTO_REGISTRY: Array<{ keywords: string[]; images: Array<{ url: string; caption: string }> }> = [
  {
    keywords: ['ai', 'frontier', 'claude', 'anthropic', 'openai', 'gpt', 'llm', 'chip', 'semiconductor', 'nvidia', 'tech', 'robot'],
    images: [
      { url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80', caption: 'Artificial Intelligence & Neural Networks Research' },
      { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', caption: 'Frontier AI Computation & Datacenter Infrastructure' },
      { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80', caption: 'Next-Generation Machine Learning Models' },
      { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', caption: 'Cybersecurity & Advanced Algorithmic Code' },
    ],
  },
  {
    keywords: ['football', 'haaland', 'soccer', 'premier league', 'goal', 'boot', 'champions', 'striker', 'arsenal', 'chelsea', 'city', 'liverpool'],
    images: [
      { url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80', caption: 'Premier League Matchday Action & Stadium Atmosphere' },
      { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', caption: 'Championship Football & Goal Scoring Highlights' },
      { url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80', caption: 'Golden Boot Contenders & High Stakes League Play' },
      { url: 'https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=1200&q=80', caption: 'Professional Football Pitch & Stadium Lights' },
    ],
  },
  {
    keywords: ['economy', 'economic', 'inflation', 'bank', 'labour', 'hiring', 'rates', 'jobs', 'gdp', 'market', 'firms', 'costs', 'recession'],
    images: [
      { url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', caption: 'Global Financial Markets & Economic Indicators' },
      { url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80', caption: 'Central Banking Policy & Monetary Analysis' },
      { url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80', caption: 'Commercial Enterprise & Labour Market Trends' },
      { url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', caption: 'Corporate Balance Sheets & Fiscal Policy' },
    ],
  },
  {
    keywords: ['trump', 'biden', 'election', 'congress', 'senate', 'white house', 'tariffs', 'court', 'presidential', 'democrat', 'republican', 'vote'],
    images: [
      { url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80', caption: 'Washington D.C. Capitol & Legislative Politics' },
      { url: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&w=1200&q=80', caption: 'White House Executive Actions & International Policy' },
      { url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80', caption: 'Electoral Campaigning & National Ballot Politics' },
    ],
  },
  {
    keywords: ['india', 'delhi', 'mumbai', 'parliament', 'bjp', 'congress', 'rupee', 'isro', 'modi'],
    images: [
      { url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80', caption: 'New Delhi Sansad Bhavan & National Governance' },
      { url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80', caption: 'Indian Economic Growth & Industrial Hubs' },
      { url: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80', caption: 'Vibrant Indian National Developments' },
    ],
  },
  {
    keywords: ['war', 'defense', 'military', 'ukraine', 'russia', 'israel', 'gaza', 'nato', 'missile', 'peace', 'tanks'],
    images: [
      { url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80', caption: 'International Security & Geopolitical Strategic Briefing' },
      { url: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1200&q=80', caption: 'Defense Deployments & Strategic Diplomacy' },
    ],
  },
  {
    keywords: ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'blockchain', 'solana', 'token', 'web3'],
    images: [
      { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', caption: 'Digital Asset Markets & Blockchain Technology' },
      { url: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1200&q=80', caption: 'Cryptocurrency Trading & Decentralized Networks' },
    ],
  },
  {
    keywords: ['oil', 'crude', 'iran', 'oman', 'opec', 'energy', 'petroleum', 'barrel', 'gas', 'tanker', 'refinery', 'drill', 'fuel'],
    images: [
      { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85', caption: 'Global Oil Markets, Tankers & Energy Infrastructure' },
      { url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85', caption: 'Energy Industry & Petroleum Refining Facility' },
      { url: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=85', caption: 'Maritime Shipping, Crude Cargo & Geopolitical Trade' },
    ],
  },
  {
    keywords: ['space', 'nasa', 'spacex', 'moon', 'mars', 'rocket', 'satellite', 'astronomy', 'telescope'],
    images: [
      { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', caption: 'Orbital Space Exploration & Satellite Telemetry' },
      { url: 'https://images.unsplash.com/photo-1517976487522-8d76378e9067?auto=format&fit=crop&w=1200&q=80', caption: 'Rocket Propulsion & Deep Space Missions' },
    ],
  },
];

/**
 * Strictly extracts images belonging ONLY to this specific story:
 * 1. The article's own primary hero image
 * 2. All inline images embedded in the article's own body HTML
 * 3. Exact-match high-res topic photography matching specific entities in the title (never unrelated articles)
 */
export function extractArticleImages(
  mainImageUrl: string | null | undefined,
  title: string,
  category: string,
  bodyHtml?: string | null,
): StoryImagePerspective[] {
  const images: StoryImagePerspective[] = [];
  const seen = new Set<string>();

  // 1. Primary Hero image of THIS article
  const primarySrc = resolvePostImageUrl(mainImageUrl);
  if (primarySrc && primarySrc !== STORY_FALLBACK_PATH) {
    images.push({
      src: primarySrc,
      alt: title,
      title: title,
    });
    seen.add(primarySrc);
  }

  // 2. Extract inline <img> URLs from THIS article's body HTML
  if (bodyHtml) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(bodyHtml)) !== null) {
      const src = match[1]?.trim();
      if (
        src &&
        !seen.has(src) &&
        !src.includes('1x1') &&
        !src.includes('pixel') &&
        !src.includes('tracker') &&
        !src.includes('badge') &&
        !src.includes('icon') &&
        src.startsWith('http')
      ) {
        const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
        const alt = altMatch && altMatch[1]?.trim() ? altMatch[1].trim() : title;
        images.push({
          src,
          alt,
          title,
        });
        seen.add(src);
      }
    }
  }

  // 3. Search high-res entity photos ONLY if specific exact subject keywords match the title
  if (images.length < 3) {
    const titleLower = title.toLowerCase();
    for (const entry of TOPIC_PHOTO_REGISTRY) {
      // Require strong title keyword match (not generic category)
      const matchesSpecificEntity = entry.keywords.some(
        (kw) => kw.length > 2 && new RegExp(`\\b${kw}\\b`, 'i').test(titleLower)
      );
      if (matchesSpecificEntity) {
        for (const topicImg of entry.images) {
          if (images.length >= 3) break;
          if (!seen.has(topicImg.url)) {
            images.push({
              src: topicImg.url,
              alt: `${title} - ${topicImg.caption}`,
              title: topicImg.caption,
            });
            seen.add(topicImg.url);
          }
        }
      }
      if (images.length >= 3) break;
    }
  }

  // Fallback to single primary image
  if (images.length === 0) {
    images.push({
      src: resolvePostImageUrl(mainImageUrl),
      alt: title,
      title: title,
    });
  }

  return images;
}

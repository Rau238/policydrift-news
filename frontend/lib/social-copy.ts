import { productionShareUrl } from '@/lib/site';
import { categoryLabel } from '@/lib/category-theme';

export interface SocialArticleInput {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  key_takeaways?: string | null;
  category: string;
  image_url?: string | null;
  source_name?: string | null;
}

export interface SocialPlatformCopy {
  platform: 'linkedin' | 'instagram' | 'facebook' | 'twitter';
  platformName: string;
  charLimit: number;
  caption: string;
  hashtags: string[];
  suggestedAspectRatio: '1:1' | '9:16' | '1.91:1' | '16:9';
}

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  politics: ['#Politics', '#PolicyUpdate', '#Governance', '#CurrentAffairs', '#NewsFree365'],
  business: ['#BusinessNews', '#Economy', '#Markets', '#Finance', '#NewsFree365'],
  economy: ['#Economy', '#Macroeconomics', '#GDP', '#FinancialMarkets', '#NewsFree365'],
  markets: ['#StockMarket', '#Trading', '#Nifty', '#Sensex', '#Investing', '#NewsFree365'],
  india: ['#IndiaNews', '#NationalUpdates', '#IndiaPolicy', '#Bharat', '#NewsFree365'],
  world: ['#WorldNews', '#GlobalAffairs', '#Geopolitics', '#InternationalNews', '#NewsFree365'],
  tech: ['#Technology', '#AI', '#TechNews', '#Innovation', '#DigitalTransformation', '#NewsFree365'],
  science: ['#Science', '#Research', '#Discovery', '#FutureTech', '#NewsFree365'],
  sports: ['#Sports', '#SportsNews', '#Cricket', '#Football', '#NewsFree365'],
  opinion: ['#Editorial', '#Opinion', '#Analysis', '#Perspectives', '#NewsFree365'],
  editorial: ['#Editorial', '#DeepDive', '#InDepth', '#Analysis', '#NewsFree365'],
};

function getHashtagsForCategory(category: string): string[] {
  const norm = (category || '').toLowerCase().trim();
  const found = CATEGORY_HASHTAGS[norm];
  if (found) return found;

  const capitalized = category ? `#${category.replace(/[^a-zA-Z0-9]/g, '')}` : '#News';
  return [capitalized, '#NewsUpdate', '#CurrentAffairs', '#NewsFree365'];
}

function cleanText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns dynamic category & breaking news emoji badge
 */
function getCategoryHook(category: string, title?: string): { emoji: string; badge: string } {
  const norm = (category || '').toLowerCase().trim();
  const titleNorm = (title || '').toLowerCase();

  if (
    titleNorm.includes('breaking') ||
    titleNorm.includes('urgent') ||
    titleNorm.includes('alert') ||
    titleNorm.includes('crisis') ||
    titleNorm.includes('war') ||
    titleNorm.includes('attack') ||
    titleNorm.includes('surge') ||
    titleNorm.includes('expires') ||
    titleNorm.includes('threatens')
  ) {
    return { emoji: '🚨', badge: 'BREAKING NEWS' };
  }

  switch (norm) {
    case 'politics':
      return { emoji: '🏛️', badge: 'POLITICS & GOVERNANCE' };
    case 'business':
    case 'markets':
      return { emoji: '📈', badge: 'MARKETS & BUSINESS' };
    case 'economy':
      return { emoji: '📊', badge: 'ECONOMIC BRIEFING' };
    case 'world':
      return { emoji: '🌍', badge: 'GLOBAL AFFAIRS' };
    case 'india':
      return { emoji: '🇮🇳', badge: 'INDIA DESK' };
    case 'tech':
      return { emoji: '🤖', badge: 'TECH & AI DISPATCH' };
    case 'science':
      return { emoji: '🔬', badge: 'SCIENCE & RESEARCH' };
    case 'sports':
      return { emoji: '🏆', badge: 'SPORTS REPORT' };
    case 'editorial':
    case 'opinion':
      return { emoji: '🖋️', badge: 'EDITORIAL ANALYSIS' };
    default:
      return { emoji: '⚡', badge: 'LATEST INTEL' };
  }
}

/**
 * Generate tailored copy for LinkedIn
 */
export function generateLinkedInCopy(article: SocialArticleInput): SocialPlatformCopy {
  const articleUrl = productionShareUrl(`/news/${article.slug}`);
  const title = cleanText(article.title);
  const excerpt = cleanText(article.excerpt);
  const tags = getHashtagsForCategory(article.category);
  const catName = categoryLabel(article.category).toUpperCase();
  const { emoji, badge } = getCategoryHook(article.category, title);

  let bodyHighlights = '';
  if (article.key_takeaways) {
    try {
      const parsed = JSON.parse(article.key_takeaways);
      if (Array.isArray(parsed) && parsed.length > 0) {
        bodyHighlights = parsed.slice(0, 3).map((item) => `🔹 ${item}`).join('\n');
      }
    } catch {
      // ignore
    }
  }

  if (!bodyHighlights && excerpt) {
    bodyHighlights = `🔹 ${excerpt}`;
  }

  const caption = `${emoji} ${badge} | ${catName}

📰 ${title}

💡 Key Takeaways:
${bodyHighlights}

👉 Read the verified policy briefing & full analysis on NewsFree365:
🔗 ${articleUrl}

${tags.join(' ')}`;

  return {
    platform: 'linkedin',
    platformName: 'LinkedIn',
    charLimit: 3050,
    caption: caption.trim(),
    hashtags: tags,
    suggestedAspectRatio: '1.91:1',
  };
}

/**
 * Generate tailored copy for Instagram (Post / Carousel / Story)
 */
export function generateInstagramCopy(article: SocialArticleInput): SocialPlatformCopy {
  const title = cleanText(article.title);
  const excerpt = cleanText(article.excerpt);
  const tags = [
    ...getHashtagsForCategory(article.category),
    '#TrendingNow',
    '#Headlines',
    '#DailyBrief',
    '#NewsAlert',
  ];
  const catName = categoryLabel(article.category).toUpperCase();
  const { emoji, badge } = getCategoryHook(article.category, title);

  let keyPoints = '';
  if (article.key_takeaways) {
    try {
      const parsed = JSON.parse(article.key_takeaways);
      if (Array.isArray(parsed) && parsed.length > 0) {
        keyPoints = parsed.slice(0, 3).map((p) => `⚡ ${p}`).join('\n');
      }
    } catch {
      // ignore
    }
  }

  if (!keyPoints && excerpt) {
    keyPoints = `⚡ ${excerpt}`;
  }

  const caption = `${emoji} ${badge} • ${catName}

📰 ${title}

👇 Swipe through for the core highlights:
${keyPoints}

💬 What is your perspective on this development? Join the discussion below!

🔗 Link to full coverage in bio & stories.
Follow @NewsFree365 for verified real-time journalism.

.
.
${tags.join(' ')}`;

  return {
    platform: 'instagram',
    platformName: 'Instagram',
    charLimit: 2200,
    caption: caption.trim(),
    hashtags: tags,
    suggestedAspectRatio: '1:1',
  };
}

/**
 * Generate tailored copy for Facebook
 */
export function generateFacebookCopy(article: SocialArticleInput): SocialPlatformCopy {
  const articleUrl = productionShareUrl(`/news/${article.slug}`);
  const title = cleanText(article.title);
  const excerpt = cleanText(article.excerpt);
  const tags = getHashtagsForCategory(article.category).slice(0, 3);
  const catName = categoryLabel(article.category).toUpperCase();
  const { emoji, badge } = getCategoryHook(article.category, title);

  const caption = `${emoji} ${badge} | ${catName}

📰 ${title}

${excerpt ? `📌 ${excerpt}\n\n` : ''}👉 Read the complete report & context on NewsFree365:
🔗 ${articleUrl}

${tags.join(' ')}`;

  return {
    platform: 'facebook',
    platformName: 'Facebook',
    charLimit: 5000,
    caption: caption.trim(),
    hashtags: tags,
    suggestedAspectRatio: '1.91:1',
  };
}

/**
 * Generate tailored copy for Twitter / X (280 char limit)
 */
export function generateTwitterCopy(article: SocialArticleInput): SocialPlatformCopy {
  const articleUrl = productionShareUrl(`/news/${article.slug}`);
  const title = cleanText(article.title);
  const tags = getHashtagsForCategory(article.category).slice(0, 2);
  const { emoji, badge } = getCategoryHook(article.category, title);

  const header = `${emoji} ${badge}: `;
  const urlAndTags = `\n\n🔗 ${articleUrl}\n${tags.join(' ')}`;
  const remainingChars = 280 - header.length - urlAndTags.length;

  let truncatedTitle = title;
  if (truncatedTitle.length > remainingChars) {
    truncatedTitle = `${truncatedTitle.slice(0, remainingChars - 3)}...`;
  }

  const caption = `${header}${truncatedTitle}${urlAndTags}`;

  return {
    platform: 'twitter',
    platformName: 'X (Twitter)',
    charLimit: 280,
    caption: caption.trim(),
    hashtags: tags,
    suggestedAspectRatio: '16:9',
  };
}

/**
 * Generate all platform bundles for a given article
 */
export function generateAllSocialBundles(article: SocialArticleInput): Record<string, SocialPlatformCopy> {
  return {
    linkedin: generateLinkedInCopy(article),
    instagram: generateInstagramCopy(article),
    facebook: generateFacebookCopy(article),
    twitter: generateTwitterCopy(article),
  };
}

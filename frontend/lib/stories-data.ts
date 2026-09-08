import type { PostListItem } from './types';
import { resolvePostImageUrl } from './story-image';

export interface StorySlide {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
  author?: string | null;
  source_feed?: string | null;
  reading_time_minutes?: number;
  view_count?: number;
  is_featured?: number;
  editorial_priority?: string;
}

export interface StoryGroup {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  slides: StorySlide[];
  badgeText?: string;
}

/**
 * Normalizes any category string into a standard canonical category & short display name.
 * Fixes duplicate lowercase categories (e.g. 'politics' vs 'Politics', 'business' vs 'Business')
 * and long awkward truncations (e.g. 'Stocks & Markets' -> 'Markets').
 */
export function normalizeCategory(raw?: string): { canonicalKey: string; displayName: string } {
  const norm = (raw || '').toLowerCase().trim();

  if (norm.includes('break') || norm.includes('live')) {
    return { canonicalKey: 'Breaking', displayName: 'Breaking' };
  }
  if (norm.includes('india') || norm.includes('delhi') || norm.includes('mumbai') || norm.includes('bharat') || norm.includes('national')) {
    return { canonicalKey: 'India', displayName: 'India' };
  }
  if (norm.includes('world') || norm.includes('global') || norm.includes('international') || norm.includes('foreign')) {
    return { canonicalKey: 'World News', displayName: 'World' };
  }
  if (norm.includes('sport') || norm.includes('cricket') || norm.includes('football') || norm.includes('tennis') || norm.includes('olympic')) {
    return { canonicalKey: 'Sports', displayName: 'Sports' };
  }
  if (norm.includes('stock') || norm.includes('market') || norm.includes('share') || norm.includes('sensex') || norm.includes('nifty')) {
    return { canonicalKey: 'Stocks & Markets', displayName: 'Markets' };
  }
  if (norm.includes('bank') || norm.includes('econom') || norm.includes('finance') || norm.includes('money') || norm.includes('rbi')) {
    return { canonicalKey: 'Banking & Economics', displayName: 'Banking' };
  }
  if (norm.includes('business') || norm.includes('trade') || norm.includes('industry') || norm.includes('corporate') || norm.includes('startup')) {
    return { canonicalKey: 'Business', displayName: 'Business' };
  }
  if (norm.includes('tech') || norm.includes('ai') || norm.includes('software') || norm.includes('cyber') || norm.includes('gadget')) {
    return { canonicalKey: 'Technology', displayName: 'Technology' };
  }
  if (norm.includes('politic') || norm.includes('legal') || norm.includes('governance') || norm.includes('election') || norm.includes('parliament')) {
    return { canonicalKey: 'Politics', displayName: 'Politics' };
  }
  if (norm.includes('crypto') || norm.includes('bitcoin') || norm.includes('blockchain') || norm.includes('ethereum')) {
    return { canonicalKey: 'Crypto', displayName: 'Crypto' };
  }

  // Fallback: title-case the first word
  const clean = raw ? raw.trim() : 'General';
  const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
  return { canonicalKey: cap, displayName: cap.slice(0, 10) };
}

/**
 * Standard Desk Priority Order for Visual Stories.
 */
const DESK_PRIORITY = [
  'Breaking',
  'India',
  'World News',
  'Sports',
  'Business',
  'Banking & Economics',
  'Politics',
  'Technology',
  'Stocks & Markets',
  'Crypto',
];

/**
 * Normalizes title for deduplication to prevent the same wire / syndicate story
 * appearing in multiple circles.
 */
function cleanTitleForComparison(title?: string | null): string {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 36);
}

/**
 * Calculates a score for ranking stories within a category:
 * 1. Admin pinned / featured stories get highest boost (+25,000 / +15,000 pts)
 * 2. High daily views (views_24h period_views) and total views
 * 3. Freshness within the last 12-48 hours
 */
function calculateStoryScore(post: PostListItem): number {
  let score = 0;

  // Admin curation flags
  if (post.editorial_priority === 'pinned') {
    score += 25000;
  } else if (post.is_featured === 1) {
    score += 15000;
  } else if (post.editorial_priority === 'high') {
    score += 8000;
  } else if (post.is_breaking === 1) {
    score += 4000;
  }

  // Views / Engagement metric (daily period views are weighted 5x)
  const views = post.view_count || 0;
  const periodViews = post.period_views || 0;
  score += (periodViews * 5) + Math.min(views, 5000);

  // Recency score (fresh posts from today get strong advantage)
  try {
    const pubTime = new Date(post.published_at).getTime();
    if (!Number.isNaN(pubTime)) {
      const ageHours = (Date.now() - pubTime) / (1000 * 60 * 60);
      if (ageHours <= 6) score += 2000;
      else if (ageHours <= 12) score += 1200;
      else if (ageHours <= 24) score += 600;
      else if (ageHours <= 48) score += 200;
    }
  } catch {
    // Ignore date parse failure
  }

  return score;
}

/**
 * Builds curated, uniquely deduplicated Story Groups grouped by canonical category.
 * Supports admin selection (featured/pinned), daily top views, and distinct stories.
 */
export function buildStoryGroups(allPosts: PostListItem[]): StoryGroup[] {
  if (!allPosts || allPosts.length === 0) return [];

  // 1. Group posts by CANONICAL category
  const groupsByCanonicalKey = new Map<
    string,
    { displayName: string; posts: PostListItem[] }
  >();

  for (const post of allPosts) {
    if (!post || !post.slug) continue;
    const { canonicalKey, displayName } = normalizeCategory(post.category);

    const existing = groupsByCanonicalKey.get(canonicalKey);
    if (existing) {
      existing.posts.push(post);
    } else {
      groupsByCanonicalKey.set(canonicalKey, { displayName, posts: [post] });
    }
  }

  // 2. Sort posts within each canonical category by score (Admin pinned > Top Views > Freshness)
  for (const group of groupsByCanonicalKey.values()) {
    group.posts.sort((a, b) => calculateStoryScore(b) - calculateStoryScore(a));
  }

  // 3. Build unique story groups following priority order
  const storyGroups: StoryGroup[] = [];
  const assignedPostIds = new Set<number>();
  const assignedTitleKeys = new Set<string>();

  // Process preferred desk order
  for (const canonicalKey of DESK_PRIORITY) {
    const groupData = groupsByCanonicalKey.get(canonicalKey);
    if (!groupData || groupData.posts.length === 0) continue;

    // Filter out posts already assigned to an earlier group to guarantee 100% unique stories
    const availablePosts = groupData.posts.filter((p) => {
      if (assignedPostIds.has(p.id)) return false;
      const titleKey = cleanTitleForComparison(p.title);
      if (titleKey && assignedTitleKeys.has(titleKey)) return false;
      return true;
    });

    if (availablePosts.length === 0) continue;

    const selectedPosts = availablePosts.slice(0, 6);
    selectedPosts.forEach((p) => {
      assignedPostIds.add(p.id);
      const titleKey = cleanTitleForComparison(p.title);
      if (titleKey) assignedTitleKeys.add(titleKey);
    });

    // Select the best cover image (preferring one with an actual image)
    const coverPost = selectedPosts.find((p) => p.image_url) || selectedPosts[0];
    const coverImage = resolvePostImageUrl(coverPost.image_url, coverPost.title, coverPost.category);

    storyGroups.push({
      id: `desk-${canonicalKey.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: groupData.displayName,
      category: canonicalKey,
      coverImage,
      slides: selectedPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        image_url: resolvePostImageUrl(p.image_url, p.title, p.category),
        category: p.category,
        published_at: p.published_at,
        author: p.author,
        source_feed: p.source_feed,
        reading_time_minutes: p.reading_time_minutes,
        view_count: p.view_count,
        is_featured: p.is_featured,
        editorial_priority: p.editorial_priority,
      })),
      badgeText: canonicalKey === 'Breaking' ? 'LIVE' : undefined,
    });

    groupsByCanonicalKey.delete(canonicalKey);
  }

  return storyGroups;
}

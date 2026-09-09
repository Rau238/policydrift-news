import type { Metadata } from 'next';
import { absoluteUrl, siteName } from '@/lib/site';
import { CATEGORY_ORDER } from '@/lib/category-theme';
import {
  CATEGORY_INTRO,
  CATEGORY_TO_SLUG,
  categoryHref,
} from '@/lib/category-routes';
import { categoryLabel } from '@/lib/categories';
import { RssFeedDirectoryClient, type CategoryFeedItem } from './RssFeedDirectoryClient';
import { Rss } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RSS Feeds Directory | Real-Time News Syndication',
  description:
    'Subscribe to NewsFree365 RSS feeds across all 16 specialized news desks, or follow our master feed in Feedly, Inoreader, Apple News, and RSS readers.',
  alternates: {
    canonical: absoluteUrl('/rss'),
    types: {
      'application/rss+xml': absoluteUrl('/feed.xml'),
    },
  },
  openGraph: {
    title: `RSS Feeds Directory | ${siteName}`,
    description:
      'Subscribe to NewsFree365 RSS feeds across all 16 specialized news desks, or follow our master feed in Feedly, Inoreader, and RSS readers.',
    url: absoluteUrl('/rss'),
    siteName,
    type: 'website',
  },
};

export default function RssDirectoryPage() {
  const masterFeedUrl = absoluteUrl('/feed.xml');

  const categories: CategoryFeedItem[] = CATEGORY_ORDER.map((name) => {
    const slug = CATEGORY_TO_SLUG[name] || name.toLowerCase().replace(/\s+/g, '-');
    const label = categoryLabel(name);
    const desc =
      CATEGORY_INTRO[name] ||
      `Real-time coverage and breaking updates from the ${label} desk on ${siteName}.`;

    return {
      key: name,
      name: label,
      slug,
      description: desc,
      feedUrl: absoluteUrl(`/feed/${slug}.xml`),
      webUrl: categoryHref(name),
    };
  });

  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px] space-y-8 sm:space-y-10">
        {/* Page Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-300">
            <Rss size={13} className="text-teal-400" />
            <span>OPEN SYNDICATION STANDARDS</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            RSS Feeds &amp; Syndication Directory
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            NewsFree365 supports the open web. Follow our live editorial coverage across all 16 news desks or stream
            our consolidated master feed directly into your preferred reader, bot, or workspace.
          </p>
        </div>

        {/* Directory Interactive Client */}
        <RssFeedDirectoryClient masterFeedUrl={masterFeedUrl} categories={categories} />
      </div>
    </div>
  );
}

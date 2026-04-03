import type { Metadata } from 'next';
import { TrendingIndiaPage } from '@/components/TrendingIndiaPage';
import { getGoogleTrendsBundle } from '@/lib/api';
import { absoluteUrl, siteName } from '@/lib/site';
import { storyFallbackImageUrl } from '@/lib/story-image';

export const dynamic = 'force-dynamic';

const description =
  'See what people in India are searching for on Google, mapped to PolicyDrift desks and matched headlines, updated from our trends cache.';

export const metadata: Metadata = {
  title: { absolute: `Trending in India | ${siteName}` },
  description,
  alternates: { canonical: absoluteUrl('/trending-india') },
  openGraph: {
    title: `Trending in India | ${siteName}`,
    description,
    url: absoluteUrl('/trending-india'),
    type: 'website',
    images: [{ url: storyFallbackImageUrl(), width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Trending in India | ${siteName}`,
    description,
    images: [storyFallbackImageUrl()],
  },
};

export default async function TrendingIndiaRoute() {
  const bundle = await getGoogleTrendsBundle({ limit24h: 14, limit7d: 14, limit30d: 20 });
  return <TrendingIndiaPage data={bundle} />;
}

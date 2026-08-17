import type { Metadata } from 'next';
import { TrendingIndiaPage } from '@/components/TrendingIndiaPage';
import { getGoogleTrendsBundle } from '@/lib/api';
import { absoluteUrl, siteName } from '@/lib/site';
import { storyFallbackImageUrl } from '@/lib/story-image';

export const dynamic = 'force-dynamic';

const description =
  'See what people in India are searching for on Google, mapped to PolicyDrift desks and matched headlines, updated from our trends cache.';

export const metadata: Metadata = {
  title: { absolute: `Trending in India — Live Search Topics & News | ${siteName}` },
  description,
  keywords: ['India trending topics', 'Google trends India', 'India news', 'viral stories India', siteName],
  alternates: { canonical: absoluteUrl('/trending-india') },
  openGraph: {
    title: `Trending in India — Live Search Topics & News | ${siteName}`,
    description,
    url: absoluteUrl('/trending-india'),
    siteName,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: storyFallbackImageUrl({ title: 'Trending in India — Live Search Topics & News', category: 'TRENDING INDIA' }),
        width: 1200,
        height: 630,
        alt: `${siteName} Trending in India`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Trending in India — Live Search Topics & News | ${siteName}`,
    description,
    site: '@policydrift',
    creator: '@policydrift',
    images: [storyFallbackImageUrl({ title: 'Trending in India — Live Search Topics & News', category: 'TRENDING INDIA' })],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default async function TrendingIndiaRoute() {
  const bundle = await getGoogleTrendsBundle({ limit24h: 14, limit7d: 14, limit30d: 20 });
  return <TrendingIndiaPage data={bundle} />;
}

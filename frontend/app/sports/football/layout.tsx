import type { Metadata } from 'next';
import { absoluteUrl, siteName } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Live Football Scores, Fixtures & Match Center',
  description:
    'Real-time football scores, Premier League, UEFA Champions League, La Liga, Serie A, fixtures, and standings on NewsFree365 Sports Hub.',
  alternates: {
    canonical: absoluteUrl('/sports/football'),
  },
  openGraph: {
    title: `Live Football Scores & Match Center | ${siteName}`,
    description:
      'Real-time football scores, tables, match updates across top global leagues on NewsFree365.',
    url: absoluteUrl('/sports/football'),
    siteName,
  },
};

export default function FootballLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

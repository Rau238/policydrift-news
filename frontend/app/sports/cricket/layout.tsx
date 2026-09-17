import type { Metadata } from 'next';
import { absoluteUrl, siteName } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Live Cricket Scores, Match Center & Ball-by-Ball Commentary',
  description:
    'Real-time cricket live scores, ball-by-ball updates, commentary, scorecards, schedules, and live match stats on NewsFree365 Sports Hub.',
  alternates: {
    canonical: absoluteUrl('/sports/cricket'),
  },
  openGraph: {
    title: `Live Cricket Scores & Match Center | ${siteName}`,
    description:
      'Real-time cricket scorecards, commentary, international & domestic series on NewsFree365.',
    url: absoluteUrl('/sports/cricket'),
    siteName,
  },
};

export default function CricketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

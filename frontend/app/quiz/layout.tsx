import type { Metadata } from 'next';
import { absoluteUrl, siteName } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Daily Current Affairs, News & GK Quiz',
  description:
    'Test your knowledge with daily interactive quizzes on current affairs, global politics, business, economics, science, and world news on NewsFree365.',
  alternates: {
    canonical: absoluteUrl('/quiz'),
  },
  openGraph: {
    title: `Daily Current Affairs & News Quiz | ${siteName}`,
    description:
      'Play daily news quizzes and interactive knowledge tests on NewsFree365.',
    url: absoluteUrl('/quiz'),
    siteName,
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

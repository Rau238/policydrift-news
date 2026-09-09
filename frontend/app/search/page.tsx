import { Metadata } from 'next';
import Link from 'next/link';
import { siteName } from '@/lib/site';
import { SearchClient } from './SearchClient';

export const metadata: Metadata = {
  title: `Search Stories & Topics | ${siteName}`,
  description: `Search verified news stories, breaking reports, market analysis, and desk archives across ${siteName}.`,
};

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string };
}) {
  const initialQuery = searchParams?.q || '';
  const initialCategory = searchParams?.category || 'all';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
        <SearchClient initialQuery={initialQuery} initialCategory={initialCategory} />
      </div>
    </main>
  );
}

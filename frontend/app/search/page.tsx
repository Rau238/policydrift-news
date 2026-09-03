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
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Title */}
        <div className="mb-6 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Search & Archives</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Search Verified News & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Find syndicated articles, breaking alerts, and editorial desk analysis across the {siteName} network.
          </p>
        </div>

        {/* Client Search Interface */}
        <SearchClient initialQuery={initialQuery} initialCategory={initialCategory} />
      </div>
    </main>
  );
}

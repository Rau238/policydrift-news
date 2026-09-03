import Link from 'next/link';
import { siteName } from '@/lib/site';
import { CategoryNav } from '@/components/CategoryNav';
import { AnimatedTrendingIcon } from '@/components/AnimatedTrendingIcon';
import { BrandMark } from '@/components/BrandMark';
import { LocalConditions } from '@/components/LocalConditions';

export function HeaderChrome() {
  return (
    <header className="sticky top-0 z-50 max-w-[100vw] overflow-x-clip border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-lg shadow-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
        <div className="flex h-14 items-center gap-3 sm:h-16">
          <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3">
            <BrandMark sizeClass="h-9 w-9 sm:h-10 sm:w-10" />
            <span className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">{siteName}</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 md:gap-3.5">
            <LocalConditions />

            <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Primary">
              <Link
                href="/sports/cricket"
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:border-emerald-500/40 hover:bg-emerald-950/40 hover:text-emerald-200"
                title="Live Cricket Scores & Matches"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Cricket
              </Link>

              <Link
                href="/trending-india"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium text-amber-200/95 transition hover:bg-amber-500/15 hover:text-amber-100 lg:px-3.5"
              >
                <AnimatedTrendingIcon className="h-4 w-4" />
                Trending India
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 p-2 text-slate-300 transition hover:border-teal-500/40 hover:bg-slate-800 hover:text-white"
                title="Search Stories & Keywords"
                aria-label="Search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 py-2.5">
          <CategoryNav />
        </div>
      </div>
    </header>
  );
}


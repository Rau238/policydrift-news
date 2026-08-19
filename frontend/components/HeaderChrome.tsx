import Link from 'next/link';
import { siteName } from '@/lib/site';
import { CategoryNav } from '@/components/CategoryNav';
import { AnimatedTrendingIcon } from '@/components/AnimatedTrendingIcon';
import { BrandMark } from '@/components/BrandMark';
import { LocalConditions } from '@/components/LocalConditions';
import { HeaderClock } from '@/components/HeaderClock';

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
            <HeaderClock />
            <LocalConditions />

            <nav className="hidden items-center md:flex" aria-label="Primary">
              <Link
                href="/trending-india"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-amber-200/95 transition hover:bg-amber-500/15 hover:text-amber-100 lg:px-4"
              >
                <AnimatedTrendingIcon className="h-4 w-4" />
                Trending India
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

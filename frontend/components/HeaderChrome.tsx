'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { siteName } from '@/lib/site';
import { CategoryNav } from '@/components/CategoryNav';
import { AnimatedTrendingIcon } from '@/components/AnimatedTrendingIcon';
import { BrandMark } from '@/components/BrandMark';
import { LocalConditions } from '@/components/LocalConditions';
import { SpotlightSearchModal } from '@/components/SpotlightSearchModal';
import { Search, Command } from 'lucide-react';

export function HeaderChrome() {
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent));

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 max-w-[100vw] overflow-x-clip border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-lg shadow-slate-900/30">
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

                {/* MacBook Spotlight Search Trigger Button */}
                <button
                  type="button"
                  onClick={() => setSpotlightOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 transition hover:border-teal-500/50 hover:bg-slate-850 hover:text-white group"
                  title="Open Spotlight Search (⌘K / Ctrl+K)"
                  aria-label="Spotlight Search"
                >
                  <Search size={14} className="text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline text-slate-400 group-hover:text-slate-200">Search</span>
                  <span className="hidden sm:flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
                    {isMac ? <Command size={10} /> : <span>Ctrl</span>}
                    <span>K</span>
                  </span>
                </button>
              </nav>
            </div>
          </div>

          <div className="border-t border-white/10 py-2.5">
            <CategoryNav />
          </div>
        </div>
      </header>

      {/* MacBook Spotlight Search Overlay */}
      <SpotlightSearchModal isOpen={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
    </>
  );
}

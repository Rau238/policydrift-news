'use client';

import Link from 'next/link';
import { Flame, Sparkles } from 'lucide-react';

const POPULAR_SEARCH_TOPICS = [
  { label: 'India News', href: '/news/india' },
  { label: 'Markets & Nifty', href: '/news/markets' },
  { label: 'Cricket Scores', href: '/sports/cricket' },
  { label: 'Global Politics', href: '/news/world' },
  { label: 'AI & Tech', href: '/news/technology' },
  { label: 'Business Headlines', href: '/news/business' },
  { label: 'Trending India', href: '/trending-india' },
];

export function TrendingSearchesBar() {
  return (
    <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm text-xs py-1.5 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 overflow-x-auto pd-scrollbar-none 2xl:max-w-[1440px]">
        <div className="flex shrink-0 items-center gap-1 font-bold text-amber-400">
          <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span className="uppercase tracking-wider text-[10px] text-slate-300">Hot Topics:</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {POPULAR_SEARCH_TOPICS.map((topic, i) => (
            <Link
              key={i}
              href={topic.href}
              className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/90 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 transition-all hover:border-teal-500/50 hover:bg-slate-800 hover:text-white"
            >
              <Sparkles className="h-2.5 w-2.5 text-teal-400 opacity-70" />
              <span>{topic.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

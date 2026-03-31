'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, LayoutGrid } from 'lucide-react';
import {
  CATEGORY_ORDER,
  categoryHref,
  categoryLabel,
  categoryNavPillClass,
  CategoryGlyph,
} from '@/lib/category-theme';

const list = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.03 },
  },
};

const chip = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
};

/** Shared pill base — compact on mobile, comfortable on md+. */
function deskPillClass(themeClass: string, extra = '') {
  return `inline-flex items-center gap-1 rounded-full font-semibold ring-1 transition active:scale-[0.98] ${themeClass} ${extra}`;
}

export function CategoryNav() {
  return (
    <motion.nav
      className="flex snap-x snap-mandatory items-center gap-1.5 overflow-x-auto overflow-y-hidden scroll-py-1 px-8 pb-1.5 pt-1 pd-scrollbar-none sm:mx-0 sm:flex-wrap sm:items-center sm:justify-end sm:gap-2 sm:overflow-visible sm:px-3 sm:pb-0 sm:pt-0.5"
      aria-label="News desks"
      variants={list}
      initial="hidden"
      animate="show"
    >
      {/* Mobile: icon-only quick links — concise */}
      <motion.span variants={chip} className="snap-start shrink-0 md:hidden">
        <Link
          href="/"
          title="Home"
          aria-label="Home"
          className="flex h-8 w-8 items-center justify-center ml-2 rounded-full bg-white/[0.08] text-teal-100 ring-1 ring-white/15 transition hover:bg-teal-500/25 hover:ring-teal-400/40"
        >
          <Home className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        </Link>
      </motion.span>
      <motion.span variants={chip} className="snap-start shrink-0 md:hidden">
        <Link
          href="/news"
          title="All news"
          aria-label="All news"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-teal-100 ring-1 ring-white/15 transition hover:bg-emerald-500/20 hover:ring-emerald-400/35"
        >
          <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        </Link>
      </motion.span>

      <motion.span
        variants={chip}
        className="mx-0.5 h-5 w-px shrink-0 bg-gradient-to-b from-transparent via-white/25 to-transparent md:hidden"
        aria-hidden
      />

      {CATEGORY_ORDER.filter((c) => c !== 'General').map((key) => (
        <motion.span key={key} variants={chip} className="snap-start shrink-0">
          <Link
            href={categoryHref(key)}
            className={deskPillClass(
              categoryNavPillClass(key),
              'px-2.5 py-1 text-[11px] leading-tight text-white max-md:shadow-sm max-md:shadow-black/20 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs',
            )}
          >
            <CategoryGlyph name={key} className="h-3 w-3 opacity-95 sm:h-3.5 sm:w-3.5" />
            <span className="whitespace-nowrap">{categoryLabel(key)}</span>
          </Link>
        </motion.span>
      ))}
    </motion.nav>
  );
}

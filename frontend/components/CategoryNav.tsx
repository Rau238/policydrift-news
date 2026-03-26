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
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const chip = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

export function CategoryNav() {
  return (
    <motion.nav
      className="-mx-1 flex items-start gap-1.5 overflow-x-auto overflow-y-hidden px-1 pb-1 pt-0.5 sm:mx-0 sm:flex-wrap sm:items-center sm:justify-end sm:overflow-visible sm:pb-0"
      aria-label="News desks"
      variants={list}
      initial="hidden"
      animate="show"
    >
      <motion.span variants={chip} className="shrink-0 md:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
        >
          <Home className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          Home
        </Link>
      </motion.span>
      <motion.span variants={chip} className="shrink-0 md:hidden">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
        >
          <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          All
        </Link>
      </motion.span>
      {CATEGORY_ORDER.filter((c) => c !== 'General').map((key) => (
        <motion.span key={key} variants={chip} className="shrink-0">
          <Link
            href={categoryHref(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white text-xs font-semibold ring-1 transition ${categoryNavPillClass(key)}`}
          >
            <CategoryGlyph name={key} className="h-3.5 w-3.5 opacity-95" />
            {categoryLabel(key)}
          </Link>
        </motion.span>
      ))}
    </motion.nav>
  );
}

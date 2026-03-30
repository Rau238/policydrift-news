'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, Menu, Radio, X } from 'lucide-react';
import { siteName } from '@/lib/site';
import {
  CATEGORY_ORDER,
  categoryDrawerRowClass,
  categoryHref,
  categoryLabel,
  CategoryGlyph,
} from '@/lib/category-theme';
import { CategoryNav } from '@/components/CategoryNav';

export function HeaderChrome() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-lg shadow-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="flex h-14 items-center justify-between gap-3 sm:h-16"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 shadow-lg shadow-teal-900/40 ring-1 ring-white/20">
              <Radio className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">{siteName}</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-teal-400/90 sm:block">
                Live desk
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <LayoutGrid className="h-4 w-4 opacity-80" aria-hidden />
              All stories
            </Link>
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white ring-1 ring-white/25 transition hover:bg-white/15 md:hidden"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-6 w-6 text-white" strokeWidth={2.5} aria-hidden />
            ) : (
              <Menu className="h-6 w-6 text-white" strokeWidth={2.5} aria-hidden />
            )}
          </button>
        </motion.div>

        <div className="hidden border-t border-white/10 py-2.5 md:block">
          <CategoryNav />
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,20rem)] flex-col border-l border-white/10 bg-slate-900 shadow-2xl md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="text-sm font-bold text-white">Menu</span>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-3">
                <Link
                  href="/"
                  className="rounded-xl px-3 py-3 text-sm font-medium text-white hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/blog"
                  className="rounded-xl px-3 py-3 text-sm font-medium text-white hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  All stories
                </Link>
              </nav>
              <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-teal-300/90">
                Desks
              </p>
              <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 pb-6 pd-scrollbar-none">
                {CATEGORY_ORDER.filter((c) => c !== 'General').map((key) => (
                  <Link
                    key={key}
                    href={categoryHref(key)}
                    className={`flex items-center gap-3 rounded-r-xl py-2.5 pl-3 pr-3 text-sm font-semibold transition ${categoryDrawerRowClass(key)}`}
                    onClick={() => setOpen(false)}
                  >
                    <CategoryGlyph name={key} className="h-4 w-4 shrink-0 text-white" />
                    <span className="text-white">{categoryLabel(key)}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div className="border-t border-white/10 py-2.5 md:hidden">
        <CategoryNav />
      </div>
    </header>
  );
}

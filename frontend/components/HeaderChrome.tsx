'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Home,
  LayoutGrid,
  Menu,
  Radio,
  Sparkles,
  X,
} from 'lucide-react';
import { formatTodayForHeader } from '@/lib/format';
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
  const [todayIso, setTodayIso] = useState('');
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    const apply = () => {
      const d = new Date();
      setTodayIso(d.toISOString().slice(0, 10));
      const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
      setTodayLabel(formatTodayForHeader(d, narrow));
    };
    apply();
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = () => apply();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const deskList = CATEGORY_ORDER.filter((c) => c !== 'General');

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-lg shadow-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="flex h-14 items-center gap-3 sm:h-16"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 shadow-lg shadow-teal-900/40 ring-1 ring-white/20">
              <Radio className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">{siteName}</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-teal-400/90 sm:block">
                Live desk
              </span>
            </span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 md:gap-4">
            <time
              className="min-w-0 shrink text-right sm:max-w-[18rem]"
              {...(todayIso ? { dateTime: todayIso } : {})}
              suppressHydrationWarning
            >
              <span className="flex items-center justify-end gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-teal-300/90 sm:gap-1.5 sm:text-[10px] sm:tracking-[0.14em]">
                <CalendarDays className="h-3 w-3 shrink-0 opacity-90 sm:h-3.5 sm:w-3.5" aria-hidden />
                Today
              </span>
              <span className="mt-0.5 block text-[10px] font-medium tabular-nums leading-snug text-teal-50/95 sm:text-[11px] md:text-xs">
                {todayLabel || '\u00a0'}
              </span>
            </time>

            <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white lg:px-4"
              >
                Home
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white lg:px-4"
              >
                <LayoutGrid className="h-4 w-4 opacity-80" aria-hidden />
                All news
              </Link>
            </nav>

            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ring-1 ring-white/25 transition hover:bg-white/15 md:hidden"
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
          </div>
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
              className="fixed inset-0 z-[60] bg-gradient-to-br from-slate-950/85 via-slate-900/75 to-teal-950/40 backdrop-blur-md md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,22rem)] flex-col overflow-hidden rounded-l-[1.75rem] border-l border-teal-500/25 bg-gradient-to-b from-slate-900 via-slate-950 to-[#050a12] shadow-[0_0_60px_-12px_rgba(20,184,166,0.35)] ring-1 ring-white/10 md:hidden"
              initial={{ x: '100%', opacity: 0.92 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.95 }}
              transition={{ type: 'spring', damping: 32, stiffness: 340, mass: 0.72 }}
            >
              <div className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl" aria-hidden />
              <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-600/10 blur-3xl" aria-hidden />

              <div className="relative border-b border-white/[0.08] bg-gradient-to-r from-teal-600/25 via-slate-900/80 to-slate-950/90 px-4 pb-4 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-800 shadow-lg shadow-teal-900/50 ring-1 ring-white/20">
                      <Sparkles className="h-5 w-5 text-white" strokeWidth={2.25} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold tracking-tight text-white">Navigate</p>
                      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.2em] text-teal-200/80">
                        {siteName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 hover:ring-2 hover:ring-teal-400/40"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                  </button>
                </div>
              </div>

              <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-8 pt-4 pd-scrollbar-none">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Start here</p>
                <nav className="grid grid-cols-2 gap-2" aria-label="Primary links">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="group flex flex-col gap-1.5 rounded-xl border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-2.5 transition hover:border-teal-400/35 hover:from-teal-500/15 hover:to-slate-900/80"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-100 ring-1 ring-teal-400/25 transition group-hover:bg-teal-500/30">
                      <Home className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                    </span>
                    <span className="font-display text-xs font-bold leading-tight text-white">Home</span>
                  </Link>
                  <Link
                    href="/news"
                    onClick={() => setOpen(false)}
                    className="group flex flex-col gap-1.5 rounded-xl border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-2.5 transition hover:border-teal-400/35 hover:from-teal-500/15 hover:to-slate-900/80"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/25 transition group-hover:bg-emerald-500/30">
                      <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                    </span>
                    <span className="font-display text-xs font-bold leading-tight text-white">All news</span>
                  </Link>
                </nav>

                <div className="my-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300/90">Desks</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" aria-hidden />
                </div>

                <motion.nav
                  className="flex flex-col gap-2"
                  aria-label="News desks"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: { staggerChildren: 0.055, delayChildren: 0.04 },
                    },
                  }}
                >
                  {deskList.map((key) => (
                    <motion.div
                      key={key}
                      variants={{
                        hidden: { opacity: 0, x: 14 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.28 } },
                      }}
                    >
                      <Link
                        href={categoryHref(key)}
                        className={`flex items-center justify-between gap-2 rounded-xl py-3 pl-3 pr-2 text-sm font-semibold transition active:scale-[0.99] ${categoryDrawerRowClass(key)}`}
                        onClick={() => setOpen(false)}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <CategoryGlyph name={key} className="h-4 w-4 shrink-0 text-white" />
                          <span className="truncate text-white">{categoryLabel(key)}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-white/40" aria-hidden />
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>

                <div className="mt-auto border-t border-white/[0.06] pt-5">
                  <Link
                    href="/editorial"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-3 text-sm text-slate-300 transition hover:border-teal-500/30 hover:bg-teal-500/10 hover:text-white"
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-teal-400/90" aria-hidden />
                    <span className="font-medium">Editorial standards</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div className="relative border-t border-white/[0.07] bg-slate-950/35 md:hidden">
              <CategoryNav />
      </div>
    </header>
  );
}

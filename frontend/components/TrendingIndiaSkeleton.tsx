import Link from 'next/link';
import { ArrowLeft, Clock3, MapPin, Newspaper } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnimatedTrendingIcon } from '@/components/AnimatedTrendingIcon';

/**
 * Pixel-perfect skeleton matching `TrendingIndiaPage` 1:1.
 * Keeps static layout frames, containers, and paddings identical to eliminate CLS and flicker.
 */
export function TrendingIndiaSkeleton() {
  return (
    <div
      className="min-h-screen w-full bg-[var(--pd-hero-deep)] text-slate-100"
      aria-busy="true"
      aria-label="Loading India trends"
    >
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-br from-amber-950/50 via-transparent to-teal-950/30"
        aria-hidden
      />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-amber-950/80 via-slate-950 to-orange-950/40">
        <div className="pointer-events-none absolute -right-8 top-0 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-orange-500/15 blur-3xl max-md:opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex w-[40%] items-end justify-end opacity-[0.12] sm:inset-y-[-6%] sm:right-[-4%] sm:w-[min(48%,32rem)] sm:items-center sm:opacity-[0.28]"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/desk/india-outline.svg"
            alt=""
            draggable={false}
            className="h-[65%] w-full object-contain object-right brightness-0 invert sm:h-full"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/50 sm:from-slate-950/70 sm:via-slate-950/40 sm:to-transparent"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14 lg:pt-8 2xl:max-w-[1440px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            Home
          </Link>

          <p className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300/90">
            <AnimatedTrendingIcon className="h-4 w-4" />
            Trending India
          </p>
          <h1 className="mt-2 max-w-xl font-display text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl">
            What India is searching
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base sm:text-slate-300">
            Live topics for India, mapped to NewsFree365 desks, with matched stories when we have coverage.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 px-3.5 py-3 ring-1 ring-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200/80">
                <AnimatedTrendingIcon className="h-4 w-4 opacity-90" />
                Topics
              </div>
              <div className="mt-1.5 h-8 sm:h-9 flex items-center">
                <Skeleton className="h-7 sm:h-8 w-14 rounded-md bg-white/20" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 px-3.5 py-3 ring-1 ring-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200/80">
                <Newspaper className="h-4 w-4 opacity-90" />
                Matched
              </div>
              <div className="mt-1.5 h-8 sm:h-9 flex items-center">
                <Skeleton className="h-7 sm:h-8 w-14 rounded-md bg-white/20" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 px-3.5 py-3 ring-1 ring-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200/80">
                <MapPin className="h-4 w-4 opacity-90" />
                Geo
              </div>
              <p className="mt-1.5 font-display font-bold tracking-tight text-white text-sm sm:text-base">
                IN
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 px-3.5 py-3 ring-1 ring-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200/80">
                <Clock3 className="h-4 w-4 opacity-90" />
                Updated
              </div>
              <div className="mt-1.5 h-6 flex items-center">
                <Skeleton className="h-4 w-24 rounded-md bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10 2xl:max-w-[1440px]">
        {/* Tab Pills matching exact geometry */}
        <div className="flex w-full flex-wrap gap-2" role="tablist" aria-label="Trend window loading">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-md shadow-amber-900/30">
            <span>Last 24 hours</span>
            <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[11px] font-bold tabular-nums">
              <Skeleton className="inline-block h-3 w-4 rounded bg-white/40 align-middle" />
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-slate-300 ring-1 ring-white/10">
            <span>Last 7 days</span>
            <span className="rounded-full bg-black/30 px-1.5 py-0.5 text-[11px] font-bold tabular-nums">
              <Skeleton className="inline-block h-3 w-4 rounded bg-white/20 align-middle" />
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-slate-300 ring-1 ring-white/10">
            <span>Last 30 days</span>
            <span className="rounded-full bg-black/30 px-1.5 py-0.5 text-[11px] font-bold tabular-nums">
              <Skeleton className="inline-block h-3 w-4 rounded bg-white/20 align-middle" />
            </span>
          </div>
        </div>

        {/* Trend Rows matching TrendRow geometry exactly */}
        <div className="mt-4 flex w-full flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <article
              key={i}
              className="group rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 py-2.5 sm:px-3.5 sm:py-3"
            >
              <div className="flex gap-2.5 sm:gap-3">
                <span className="mt-0.5 flex h-8 w-9 sm:h-8 sm:w-10 shrink-0 items-center justify-center rounded-md font-display text-[11px] font-black tabular-nums ring-1 bg-white/5 text-slate-300 ring-white/12 sm:text-xs">
                  #{String(i + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1">
                  <Skeleton className="h-5 w-[min(100%,20rem)] rounded-md bg-white/20" />
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Skeleton className="h-2.5 w-14 rounded-full bg-white/15" />
                    <span className="text-slate-600 text-xs">·</span>
                    <Skeleton className="h-2.5 w-20 rounded-full bg-white/10" />
                  </div>

                  {i < 4 && (
                    <div className="mt-2 space-y-1.5 border-t border-white/[0.06] pt-2">
                      <div className="flex items-center gap-2">
                        <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-teal-400/70" />
                        <Skeleton className="h-3 w-4/5 max-w-sm rounded bg-white/15" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}


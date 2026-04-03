import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PostCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

function DarkLine({ className }: { className: string }) {
  return <div className={`rounded-md bg-white/[0.14] ${className}`} aria-hidden />;
}

export function MarketsAsideSkeleton() {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-900 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-white/20" />
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-3.5 w-20 bg-white/25" />
            <Skeleton className="h-2.5 w-32 max-w-full bg-white/15" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-white/15" />
      </div>
      <div className="divide-y divide-slate-100 border-b border-slate-100 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Top movers</p>
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-2 px-3 py-2.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
      <div className="p-3">
        <Skeleton className="mb-2 h-3 w-16" />
        <div className="space-y-2 rounded-lg border border-slate-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-none first:rounded-t-lg last:rounded-b-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendingAsideSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-surface-card">
      <div className="border-b border-slate-200/90 px-4 py-4 sm:px-7 sm:py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-200/80 px-2 py-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Matches `/news/[categorySlug]` layout: dark hero, story grid, markets + trending asides.
 */
export function NewsCategoryHubSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" aria-busy="true" aria-label="Loading desk">
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white sm:px-6 sm:py-12">
        <div
          className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl md:px-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            All news
          </Link>
          <p className="sr-only" role="status" aria-live="polite">
            Loading desk…
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <DarkLine className="h-10 w-44 rounded-full" />
            <DarkLine className="h-5 w-28" />
          </div>
          <DarkLine className="mt-4 h-9 w-[min(16rem,85vw)] sm:h-11 sm:w-[min(20rem,90vw)]" />
          <div className="mt-4 max-w-2xl space-y-2">
            <DarkLine className="h-4 w-full" />
            <DarkLine className="h-4 w-full max-w-xl" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_min(380px,100%)] lg:items-start lg:gap-10">
          <div>
            <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="min-w-0">
                  <PostCardSkeleton />
                </li>
              ))}
            </ul>
            <nav
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
              aria-label="Pagination loading"
              aria-busy="true"
            >
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </nav>
          </div>
          <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-24">
            <MarketsAsideSkeleton />
            <TrendingAsideSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Breaking / sidebar list - matches `SidebarPostList` chrome. */
function BreakingAsideSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-rose-200/90 bg-white shadow-sm">
      <div className="border-b border-slate-200/90 px-4 py-4 sm:px-7 sm:py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full bg-rose-100/80" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-52 max-w-full" />
          </div>
        </div>
      </div>
      <ul className="m-0 list-none divide-y divide-slate-100 p-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex gap-3 px-4 py-3 sm:px-7">
            <Skeleton className="h-12 w-[4.5rem] shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2 py-0.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[85%] max-w-[12rem]" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Matches `/news/[slug]` article detail: back link, breadcrumbs, chip, meta, title, excerpt, curator card,
 * hero 16/10, key-takeaways band, prose, footer CTA, related grid - plus markets + breaking asides on lg.
 */
export function NewsArticleSkeleton() {
  return (
    <div className="min-h-screen bg-paper" aria-busy="true" aria-label="Loading article">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
        <p
          className="mb-5 text-center text-[13px] font-medium text-slate-500 sm:text-left"
          role="status"
          aria-live="polite"
        >
          Loading story…
        </p>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(380px,100%)] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <article className="relative w-full max-w-2xl">
              <Skeleton className="mb-4 h-4 w-14 rounded" />

              <header className="border-b border-slate-200/90 pb-4">
                <div className="flex flex-wrap gap-x-1.5 gap-y-1">
                  <Skeleton className="h-3 w-8 rounded" />
                  <Skeleton className="h-3 w-1 rounded-full" />
                  <Skeleton className="h-3 w-10 rounded" />
                  <Skeleton className="h-3 w-1 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
                <Skeleton className="mt-3 h-9 w-[min(100%,14rem)] rounded-full" />
                <div className="mt-2.5 flex gap-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="mt-3 h-8 w-full max-w-xl sm:h-9" />
                <Skeleton className="mt-3 h-4 w-full max-w-lg" />
                <Skeleton className="mt-2 h-4 w-full max-w-md" />

                <div className="mt-4 flex gap-3 rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3.5">
                  <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2 py-0.5">
                    <Skeleton className="h-2.5 w-20" />
                    <Skeleton className="h-4 w-44 max-w-full" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-full max-w-sm" />
                  </div>
                </div>
              </header>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-sm ring-2 ring-slate-200/40 ring-offset-0 ring-offset-paper">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
              </div>

              <div className="mt-6 rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/90 to-slate-50/80 px-4 py-4 ring-1 ring-teal-900/5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-3 w-full max-w-sm" />
                <div className="mt-3 space-y-2 pl-1">
                  <Skeleton className="h-3 w-full max-w-lg" />
                  <Skeleton className="h-3 w-full max-w-md" />
                  <Skeleton className="h-3 w-full max-w-xl" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full max-w-[95%]" />
                <Skeleton className="h-4 w-full max-w-[88%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full max-w-[92%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="mt-8 border-t border-slate-200 pt-5">
                <Skeleton className="h-3 w-full max-w-md" />
                <Skeleton className="mt-2 h-3 w-full max-w-sm" />
                <Skeleton className="mt-4 h-10 w-full max-w-[220px] rounded-lg" />
                <Skeleton className="mt-5 h-3.5 w-20" />
              </div>
            </article>

            <section className="mt-10 w-full max-w-2xl border-l-4 border-slate-200 pl-4 pt-6 sm:pl-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>
              <ul className="mt-4 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="min-w-0">
                    <PostCardSkeleton compact />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24">
            <MarketsAsideSkeleton />
            <BreakingAsideSkeleton />
          </aside>
        </div>
      </div>
    </div>
  );
}

/**
 * Matches `/news` index: Newsroom hero, filter chips, grid + asides.
 */
export function NewsroomIndexSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" aria-busy="true" aria-label="Loading newsroom">
      <div className="border-b border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10 text-white sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl md:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300/90" role="status" aria-live="polite">
            Newsroom
          </p>
          <div className="mt-2 space-y-3">
            <DarkLine className="h-9 w-[min(14rem,70vw)] sm:h-11 sm:w-[min(16rem,85vw)]" />
            <div className="space-y-2">
              <DarkLine className="h-4 w-full max-w-2xl" />
              <DarkLine className="h-4 w-full max-w-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <Skeleton className="h-6 w-40 sm:h-7 sm:w-44" />
        <Skeleton className="mt-2 h-4 w-full max-w-lg" />
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-[7.25rem] rounded-full" />
          ))}
        </div>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_min(380px,100%)] lg:items-start lg:gap-10">
          <div>
            <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="min-w-0">
                  <PostCardSkeleton />
                </li>
              ))}
            </ul>
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination loading">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </nav>
          </div>
          <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-24">
            <MarketsAsideSkeleton />
            <TrendingAsideSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

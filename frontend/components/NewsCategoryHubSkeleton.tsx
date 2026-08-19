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
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div
          className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14 2xl:max-w-[1440px]">
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

      {/* Body Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 2xl:max-w-[1440px]">
        {/* Lead Feature Story Spotlight Skeleton */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] sm:h-[220px] sm:grid sm:grid-cols-12">
          <div className="relative aspect-[16/9] w-full bg-slate-100 sm:col-span-5 sm:aspect-auto sm:h-full lg:col-span-4">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <div className="flex h-full flex-col justify-between overflow-hidden p-4 sm:col-span-7 sm:p-5 lg:col-span-8 lg:p-5">
            <div className="space-y-2.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-6 w-full max-w-md" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-2 h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          </div>
        </div>

        {/* 4-Column Magazine Grid Skeleton */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-2.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="min-w-0">
              <PostCardSkeleton compact />
            </li>
          ))}
        </ul>

        {/* Pagination Skeleton */}
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          aria-label="Pagination loading"
          aria-busy="true"
        >
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </nav>
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
 * Matches `/news/[slug]` article detail: dark top bar, large title, hero, curator,
 * key-takeaways, prose, CTA footer, related grid — plus markets + breaking asides on lg.
 */
export function NewsArticleSkeleton() {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50"
      aria-busy="true"
      aria-label="Loading article"
    >
      <div className="border-b border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8 2xl:max-w-[1440px]">
          <Skeleton className="h-4 w-20 rounded bg-white/10" />
          <Skeleton className="h-3 w-40 rounded bg-white/10" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pb-20 lg:pt-10 2xl:max-w-[1440px]">


        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_min(360px,100%)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <article className="relative w-full max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="mt-4 h-10 w-full max-w-xl sm:h-12" />
              <Skeleton className="mt-3 h-5 w-full max-w-lg" />
              <Skeleton className="mt-2 h-5 w-full max-md" />

              <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-lg">
                <Skeleton className="aspect-[16/9] w-full rounded-none sm:aspect-[2/1]" />
              </div>

              <div className="mt-5 flex gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2 py-0.5">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-4 w-44 max-w-full" />
                  <Skeleton className="h-3 w-full max-w-sm" />
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-teal-200/70">
                <div className="border-b border-teal-100 bg-teal-50/80 px-4 py-3">
                  <Skeleton className="h-5 w-36" />
                </div>
                <div className="space-y-3 px-4 py-4">
                  <Skeleton className="h-4 w-full max-w-lg" />
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-4 w-full max-w-xl" />
                </div>
              </div>

              <div className="mt-9 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full max-w-[95%]" />
                <Skeleton className="h-5 w-full max-w-[88%]" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full max-w-[92%]" />
                <Skeleton className="h-5 w-40" />
              </div>

              <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                  <Skeleton className="h-3 w-full max-w-md" />
                </div>
                <div className="flex flex-wrap gap-3 px-5 py-4">
                  <Skeleton className="h-11 w-48 rounded-xl" />
                  <Skeleton className="h-4 w-32 self-center" />
                </div>
              </div>
            </article>

            <section className="mt-12 w-full max-w-3xl rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>
              <ul className="mt-5 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
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
 * Matches `/news` index: Newsroom hero, grid + asides.
 */
export function NewsroomIndexSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" aria-busy="true" aria-label="Loading newsroom">
      <div className="border-b border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14 2xl:max-w-[1440px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300/90" role="status" aria-live="polite">
            Archive
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

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14 2xl:max-w-[1440px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_min(380px,100%)] lg:items-start lg:gap-10">
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

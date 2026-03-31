import { BrandLoader } from '@/components/ui/BrandLoader';
import { PostCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

function DarkLine({ className }: { className: string }) {
  return (
    <div
      className={`animate-shimmer relative overflow-hidden rounded-md bg-white/[0.12] ${className}`}
      aria-hidden
    />
  );
}

function MarketsAsideSkeleton() {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white sm:px-6 sm:py-12">
        <div
          className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:px-6 md:gap-10">
          <div className="shrink-0 [&_p]:text-slate-200">
            <BrandLoader label="Loading feed…" />
          </div>
          <div className="min-w-0 flex-1 space-y-5">
            <DarkLine className="h-4 w-28" />
            <div className="flex flex-wrap items-center gap-3">
              <DarkLine className="h-10 w-40 rounded-full" />
              <DarkLine className="h-5 w-24" />
            </div>
            <DarkLine className="h-10 w-[min(20rem,85vw)] max-w-full sm:h-12" />
            <div className="space-y-2.5">
              <DarkLine className="h-4 w-full max-w-2xl" />
              <DarkLine className="h-4 w-full max-w-xl" />
              <DarkLine className="h-4 max-w-lg w-[min(100%,28rem)]" />
            </div>
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

/** Matches `/news/[slug]` article layout (minimal detail page). */
export function NewsArticleSkeleton() {
  return (
    <div className="min-h-[65vh] bg-paper px-4 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mb-5 h-3.5 w-16 rounded" />
        <div className="border-b border-slate-200/90 pb-5">
          <Skeleton className="h-2.5 w-48" />
          <Skeleton className="mt-3 h-3 w-64 max-w-full" />
          <Skeleton className="mt-4 h-8 w-full max-w-xl" />
          <Skeleton className="mt-3 h-3.5 w-full max-w-lg" />
        </div>
        <Skeleton className="mt-5 aspect-[16/10] w-full rounded-xl" />
        <div className="mt-7 space-y-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-3.5 w-full ${i % 5 === 4 ? 'max-w-[90%]' : ''}`} />
          ))}
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6">
          <Skeleton className="h-3 w-full max-w-sm" />
          <Skeleton className="mt-4 h-10 w-full max-w-xs rounded-lg" />
          <Skeleton className="mt-6 h-3.5 w-24" />
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="border-b border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:px-6 md:gap-10">
          <div className="shrink-0 [&_p]:text-slate-200">
            <BrandLoader label="Opening newsroom…" />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <DarkLine className="h-3 w-24" />
            <DarkLine className="h-10 w-[min(18rem,90vw)] sm:h-12" />
            <div className="space-y-2">
              <DarkLine className="h-4 w-full max-w-2xl" />
              <DarkLine className="h-4 w-full max-w-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-[7.25rem] rounded-full" />
          ))}
        </div>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_min(380px,100%)] lg:items-start lg:gap-10">
          <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="min-w-0">
                <PostCardSkeleton />
              </li>
            ))}
          </ul>
          <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-24">
            <MarketsAsideSkeleton />
            <TrendingAsideSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

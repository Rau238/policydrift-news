import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

function TrendCardShell() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white pl-3 pr-3.5 pb-3.5 pt-3.5 shadow-sm sm:pl-3.5 sm:pr-4 sm:pb-4 sm:pt-4">
      <div
        className="absolute inset-y-2.5 left-0 w-1 rounded-full bg-gradient-to-b from-teal-200 to-cyan-200"
        aria-hidden
      />
      <div className="flex gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[85%] max-w-sm" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-2 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2.5">
        <div className="space-y-1">
          <Skeleton className="h-2 w-12" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-2 w-full self-center rounded-full" />
      </div>
    </div>
  );
}

/** Matches `TrendingIndiaPage` layout: breadcrumb, header, tab row, topic grid. */
export function TrendingIndiaSkeleton() {
  return (
    <div
      className="min-h-screen w-full bg-[#f4f6f9] text-slate-900"
      aria-busy="true"
      aria-label="Loading India trends"
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_360px_at_50%_-60px,rgba(13,148,136,0.06),transparent)]" aria-hidden />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-5 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-400">
          <Link href="/" className="hover:text-teal-700">
            Home
          </Link>
          <span>/</span>
          <Skeleton className="inline-block h-3 w-24 rounded" />
        </div>

        <header className="mt-5 grid gap-4 border-b border-slate-200/90 pb-6 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-8">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-[min(100%,22rem)] max-w-full sm:h-10" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </header>

        <p className="mt-6 text-[13px] font-medium text-slate-500" role="status" aria-live="polite">
          Loading trends…
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[5.25rem] w-full rounded-xl sm:h-[5.5rem]" />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrendCardShell key={i} />
          ))}
        </div>

        <Skeleton className="mx-auto mt-10 h-8 max-w-3xl rounded" />
      </div>
    </div>
  );
}

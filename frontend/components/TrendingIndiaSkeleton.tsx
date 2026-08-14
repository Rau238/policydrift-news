import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

/** Matches dark newsroom `TrendingIndiaPage` layout. */
export function TrendingIndiaSkeleton() {
  return (
    <div
      className="min-h-screen w-full bg-[var(--pd-hero-deep)] text-slate-100"
      aria-busy="true"
      aria-label="Loading India trends"
    >
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-amber-950/80 via-slate-950 to-orange-950/40">
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 md:px-6">
          <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-white">
            Home
          </Link>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-3 w-28 bg-white/10" />
            <Skeleton className="h-10 w-[min(100%,22rem)] bg-white/10" />
            <Skeleton className="h-4 w-80 max-w-full bg-white/10" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[4.5rem] rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:px-6">
        <p className="text-[13px] font-medium text-slate-500" role="status">
          Loading trends…
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-36 rounded-xl bg-white/10" />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 sm:px-4"
            >
              <Skeleton className="h-10 w-12 shrink-0 rounded-lg bg-white/10" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-32 bg-white/10" />
                <Skeleton className="h-4 w-full max-w-md bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Fluid, elegant skeleton placeholders with smooth, non-glaring ambient shimmer.
 * Colors are carefully calibrated to prevent harsh contrast flashing.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 transition-colors ${className}`}
      aria-hidden
    />
  );
}

export function PostCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/70 bg-white shadow-xs sm:rounded-[22px] ${
        compact ? 'w-[min(290px,calc(100vw-2rem))] shrink-0 sm:w-[290px]' : 'w-full'
      }`}
    >
      {/* Header Image Placeholder */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100">
        <Skeleton className="h-full w-full rounded-none bg-slate-200/60" />
      </div>

      {/* Content Skeleton */}
      <div className={`flex flex-1 flex-col justify-between space-y-3 ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded-full bg-slate-200/80" />
            <Skeleton className="h-3 w-14 rounded-full bg-slate-200/60" />
          </div>
          <Skeleton className="h-4 w-full rounded-md bg-slate-200/80" />
          <Skeleton className="h-4 w-4/5 rounded-md bg-slate-200/70" />
        </div>

        {!compact ? (
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-full rounded-md bg-slate-100" />
            <Skeleton className="h-3 w-3/4 rounded-md bg-slate-100" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LeadStorySkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl sm:h-[13.5rem] sm:flex-row lg:h-[14rem]">
      <Skeleton className="aspect-[16/9] w-full rounded-none bg-slate-800/60 sm:aspect-auto sm:h-full sm:w-[42%]" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full bg-slate-800/80" />
            <Skeleton className="h-5 w-20 rounded-full bg-slate-800/70" />
          </div>
          <Skeleton className="h-5 w-full rounded-md bg-slate-800/80" />
          <Skeleton className="h-4 w-4/5 rounded-md bg-slate-800/60" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-24 rounded-full bg-slate-800/60" />
          <Skeleton className="h-4 w-20 rounded-full bg-slate-800/70" />
        </div>
      </div>
    </div>
  );
}

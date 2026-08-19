/**
 * Fluid, elegant skeleton placeholders with smooth ambient shimmer
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/85 ${className}`}
      aria-hidden
    />
  );
}

export function PostCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-col overflow-hidden rounded-[20px] bg-slate-100 shadow-sm sm:rounded-[22px] ${
        compact ? 'w-[min(290px,calc(100vw-2rem))] shrink-0 sm:w-[290px]' : 'w-full'
      }`}
    >
      {/* Header Image Placeholder */}
      <Skeleton className="aspect-[16/10] w-full rounded-none bg-slate-200/95" />

      {/* Content Skeleton */}
      <div className={`flex flex-1 flex-col justify-between space-y-3.5 ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-3 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4.5 w-full rounded-md" />
          <Skeleton className="h-4.5 w-4/5 rounded-md" />
        </div>

        {!compact ? (
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-3/4 rounded-md" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LeadStorySkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-slate-950/80 backdrop-blur-xl shadow-2xl sm:h-[13.5rem] sm:flex-row lg:h-[14rem]">
      <Skeleton className="aspect-[16/9] w-full rounded-none bg-slate-800/80 sm:aspect-auto sm:h-full sm:w-[42%]" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full bg-slate-800/90" />
            <Skeleton className="h-5 w-20 rounded-full bg-slate-800/90" />
          </div>
          <Skeleton className="h-5 w-full rounded-md bg-slate-800/90" />
          <Skeleton className="h-4 w-4/5 rounded-md bg-slate-800/60" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-24 rounded-full bg-slate-800/70" />
          <Skeleton className="h-4 w-20 rounded-full bg-slate-800/70" />
        </div>
      </div>
    </div>
  );
}

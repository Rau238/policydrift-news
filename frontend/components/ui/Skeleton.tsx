/** Static placeholders, no shimmer (avoids route-loading flicker and busy motion). */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-slate-200/80 ${className}`}
      aria-hidden
    />
  );
}

export function PostCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-sm sm:rounded-[1.25rem] ${
        compact ? 'w-[min(290px,calc(100vw-2rem))] shrink-0 sm:w-[290px]' : 'w-full'
      }`}
    >
      <Skeleton className="aspect-[16/10] w-full rounded-none bg-slate-300/80" />
      <div className={`flex flex-col justify-between space-y-3 ${compact ? 'p-3 sm:p-3.5' : 'p-3.5 sm:p-4'}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        {!compact ? (
          <>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </>
        ) : null}
      </div>
    </div>
  );
}

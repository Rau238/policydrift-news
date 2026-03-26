export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer relative overflow-hidden rounded-lg bg-slate-200/90 ${className}`}
      aria-hidden
    />
  );
}

export function PostCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04] ${
        compact ? 'w-[min(300px,calc(100vw-2rem))] shrink-0 sm:w-[300px]' : 'w-full'
      }`}
    >
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className={`space-y-3 ${compact ? 'p-4' : 'p-5'}`}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        {!compact ? (
          <>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </>
        ) : null}
      </div>
    </div>
  );
}

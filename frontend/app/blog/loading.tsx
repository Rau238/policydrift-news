import { BrandLoader } from '@/components/ui/BrandLoader';
import { PostCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function BlogLoading() {
  return (
    <div className="min-h-[65vh] bg-gradient-to-b from-slate-50 via-white to-slate-100/80">
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
          <BrandLoader label="Opening newsroom…" />
          <div className="hidden flex-1 space-y-4 sm:block">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-11 w-64 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-[7.25rem] rounded-full" />
          ))}
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

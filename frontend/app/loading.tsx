import { BrandLoader } from '@/components/ui/BrandLoader';
import { PostCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function RootLoading() {
  return (
    <div className="min-h-[75vh] bg-paper">
      <section className="relative overflow-hidden border-b border-teal-950/40 bg-gradient-to-br from-brand-night via-brand-deep to-[#134e4a] px-4 py-14 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="flex flex-col items-center justify-center gap-6 text-center lg:items-start lg:text-left">
            <BrandLoader label="Loading latest coverage…" />
            <div className="hidden w-full max-w-md space-y-3 lg:block">
              <Skeleton className="mx-auto h-3 w-28 rounded-full lg:mx-0" />
              <Skeleton className="mx-auto h-10 w-full max-w-lg lg:mx-0" />
              <Skeleton className="mx-auto h-10 w-4/5 max-w-md lg:mx-0" />
              <Skeleton className="mx-auto mt-4 h-11 w-44 rounded-xl lg:mx-0" />
            </div>
          </div>
          <div className="hidden lg:block">
            <Skeleton className="aspect-[16/10] w-full rounded-3xl border border-white/20 bg-slate-700/30 ring-2 ring-white/15" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="rounded-3xl border border-slate-200 bg-surface-card p-5 sm:p-7">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-accent-soft/80" />
              <Skeleton className="h-8 w-48 max-w-[70%]" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="hidden h-10 w-28 shrink-0 rounded-xl sm:block" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="mt-16 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-1 w-12 rounded-full" />
            <Skeleton className="h-8 w-56 max-w-[80%]" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

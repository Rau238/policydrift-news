import { BrandLoader } from '@/components/ui/BrandLoader';
import { Skeleton } from '@/components/ui/Skeleton';

export default function NewsArticleLoading() {
  return (
    <article className="min-h-[60vh] bg-gradient-to-b from-white to-slate-50/90 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center gap-8 py-6 sm:flex-row sm:items-start sm:gap-10 sm:py-10">
          <BrandLoader label="Loading article…" />
          <div className="hidden w-full flex-1 space-y-4 sm:block">
            <Skeleton className="h-3 w-40 rounded-full" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4 rounded-md" />
          </div>
        </div>
        <Skeleton className="mt-6 aspect-[16/9] w-full rounded-xl" />
        <div className="mt-10 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </article>
  );
}

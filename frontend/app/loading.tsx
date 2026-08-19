import { LeadStorySkeleton, PostCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function RootLoading() {
  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-paper" aria-busy="true" aria-label="Loading PolicyDrift">
      <div className="relative overflow-x-clip">
        {/* Full-Width Linear Gradient Fade with Exact Matching Easing Mask */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(48rem,100vw)] bg-gradient-to-b from-[#050e24] via-[#091838] to-[#040816]"
          style={{
            maskImage:
              'linear-gradient(to bottom, #000 8%, rgba(0,0,0,0.85) 24%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.25) 68%, rgba(0,0,0,0.06) 86%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, #000 8%, rgba(0,0,0,0.85) 24%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.25) 68%, rgba(0,0,0,0.06) 86%, transparent 100%)',
          }}
          aria-hidden
        />

        {/* Hero Section Skeleton (Matching 1:1 Geometry with page.tsx) */}
        <section className="relative mx-auto flex max-w-7xl min-h-0 flex-col px-4 pb-14 pt-8 max-lg:px-3.5 max-lg:pb-12 max-lg:pt-7 sm:px-6 sm:pb-16 sm:pt-9 lg:px-6 lg:pb-20 lg:pt-10">
          <div className="grid items-center gap-6 max-lg:gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Hero Left Column (5 Cols) */}
            <div className="space-y-4 lg:col-span-5 xl:col-span-5">
              <Skeleton className="h-6 w-36 rounded-full bg-slate-800/80" />
              <div className="space-y-2 pt-1">
                <Skeleton className="h-9 w-full max-w-sm rounded-lg bg-slate-800/90 sm:h-10" />
                <Skeleton className="h-9 w-3/4 max-w-xs rounded-lg bg-slate-800/90 sm:h-10" />
              </div>
              <Skeleton className="h-4 w-5/6 max-w-md rounded-md bg-slate-800/60" />
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Skeleton className="h-11 w-28 rounded-xl bg-teal-700/50" />
                <Skeleton className="h-11 w-24 rounded-xl bg-slate-800/70" />
                <Skeleton className="h-11 w-36 rounded-xl bg-slate-800/70" />
              </div>
            </div>

            {/* Hero Right Column: Lead Story Card Skeleton (7 Cols) */}
            <div className="min-w-0 lg:col-span-7 xl:col-span-7">
              <LeadStorySkeleton />
            </div>
          </div>
        </section>

        {/* Main Content Layout Skeleton */}
        <main className="relative mx-auto max-w-7xl px-4 py-8 max-lg:px-3.5 max-lg:py-8 sm:px-6 sm:py-10">
          <div className="grid min-w-0 gap-8 max-lg:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,min(380px,100%))] lg:items-start">
            {/* Left Column: Breaking Desk & Latest Feed */}
            <div className="min-w-0 space-y-12 max-lg:space-y-10 lg:space-y-20">
              {/* Breaking Desk Skeleton */}
              <section className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24 rounded-full bg-rose-400/40" />
                    <Skeleton className="h-8 w-44 rounded-lg bg-slate-800/80" />
                    <Skeleton className="h-4 w-64 max-w-md rounded-md bg-slate-700/60" />
                  </div>
                  <Skeleton className="hidden h-10 w-36 rounded-xl bg-slate-800/60 sm:block" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                  ))}
                </div>
              </section>

              {/* Latest Across Desks Skeleton */}
              <section className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24 rounded-full bg-slate-200" />
                    <Skeleton className="h-8 w-52 rounded-lg bg-slate-300/80" />
                    <Skeleton className="h-4 w-80 max-w-lg rounded-md bg-slate-200" />
                  </div>
                  <Skeleton className="hidden h-10 w-32 rounded-xl bg-slate-200 sm:block" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Live Markets & Trending Aside Skeleton */}
            <div className="flex min-w-0 flex-col gap-6 max-lg:mt-1 max-lg:gap-6 lg:sticky lg:top-24 lg:gap-8">
              {/* Markets Box Skeleton */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <div className="bg-slate-900 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-teal-500/20" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-20 bg-slate-700" />
                      <Skeleton className="h-3 w-28 bg-slate-800" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="h-6 w-6 rounded-full bg-slate-200" />
                        <Skeleton className="h-4 w-16 bg-slate-200" />
                      </div>
                      <Skeleton className="h-4 w-20 bg-slate-200" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Box Skeleton */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <Skeleton className="h-6 w-32 rounded-lg bg-slate-300/80" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-1">
                    <Skeleton className="h-7 w-7 shrink-0 rounded-lg bg-slate-200" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-full bg-slate-200" />
                      <Skeleton className="h-3 w-2/3 bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

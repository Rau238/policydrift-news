import { LeadStorySkeleton, PostCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { Sparkles, Star } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-clip bg-paper" aria-busy="true" aria-label="Loading NewsFree365">
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
        <section className="relative mx-auto flex max-w-7xl min-h-0 flex-col px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-9 lg:px-8 lg:pb-20 lg:pt-10 2xl:max-w-[1440px]">
          <div className="grid items-center gap-6 max-lg:gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
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
        <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 2xl:max-w-[1440px]">
          <div className="grid min-w-0 gap-8 max-lg:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,min(380px,100%))] lg:items-start">
            {/* Left Column: Visual Stories, Breaking Desk, Spotlight, Top Stories, Trending, and Latest */}
            <div className="min-w-0 space-y-8 max-lg:space-y-8 lg:space-y-12">
              {/* Visual Stories Rail Skeleton */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5 sm:p-4 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded bg-white/20" />
                </div>
                <div className="flex items-center gap-3 overflow-hidden py-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500/30 to-teal-500/30">
                        <Skeleton className="h-full w-full rounded-full bg-slate-800" />
                      </div>
                      <Skeleton className="h-2.5 w-12 rounded bg-slate-800" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 1. Breaking Desk Skeleton */}
              <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24 rounded-full bg-rose-500/20" />
                    <Skeleton className="h-8 w-44 rounded-lg bg-slate-900/80" />
                    <Skeleton className="h-4 w-64 max-w-md rounded-md bg-slate-600/50" />
                  </div>
                  <Skeleton className="hidden h-10 w-36 rounded-xl bg-slate-200 sm:block" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                  ))}
                </div>
              </section>

              {/* 2. Editorial Spotlight Carousel Skeleton (Exact Height & Geometry) */}
              <section className="relative my-6 select-none">
                <div className="mb-3.5 sm:mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200/80 bg-amber-50 shadow-xs">
                      <Sparkles className="h-4 w-4 text-amber-600" strokeWidth={2.25} aria-hidden />
                    </span>
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
                      Editorial Desk Spotlight
                    </h2>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 max-w-2xl">
                    Original policy intelligence, landmark investigative reports and deep-dive analysis published by our editors.
                  </p>
                </div>

                {/* Main Card Skeleton */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#1a0c03] via-[#2a1306] to-[#0d0502] shadow-xl h-[430px] sm:h-[380px] md:h-[305px] lg:h-[315px]">
                  <div className="grid grid-cols-1 md:grid-cols-12 h-full w-full">
                    <div className="h-[180px] sm:h-[185px] md:h-full md:col-span-5 bg-slate-900/90 animate-pulse" />
                    <div className="relative flex flex-col justify-between p-4 sm:p-5 md:p-5 lg:p-6 md:col-span-7 h-[250px] sm:h-[195px] md:h-full">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <Skeleton className="h-5 w-28 rounded-full bg-amber-500/20" />
                          <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
                          <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
                        </div>
                        <Skeleton className="h-6 sm:h-7 w-4/5 rounded-md bg-white/20" />
                        <Skeleton className="h-4 w-full rounded-md bg-white/10" />
                        <Skeleton className="h-4 w-3/4 rounded-md bg-white/10" />
                      </div>
                      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-white/15">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-white/10" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-24 rounded bg-white/20" />
                            <Skeleton className="h-2.5 w-16 rounded bg-white/10" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg bg-amber-500/40" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indicator Dots Skeleton */}
                <div className="mt-2.5 flex items-center justify-center gap-1.5">
                  <div className="h-1.5 w-6 rounded-full bg-amber-400/70" />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                </div>

                {/* Thumbnails Rail Skeleton */}
                <div className="mt-2.5 flex items-stretch gap-2 overflow-hidden">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex h-[58px] sm:h-[62px] w-[210px] sm:w-[230px] shrink-0 items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white/90 p-1.5"
                    >
                      <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-lg bg-slate-200" />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <Skeleton className="h-2 w-14 rounded bg-slate-200" />
                        <Skeleton className="h-3 w-full rounded bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Top Stories Section Skeleton */}
              <section className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/80 bg-amber-50">
                      <Star className="h-4 w-4 text-amber-500" strokeWidth={2.25} aria-hidden />
                    </span>
                    <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                      Top Stories
                    </h2>
                  </div>
                  <Skeleton className="h-8 w-36 rounded-lg bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                  ))}
                </div>
              </section>

              {/* 4. Trending & Popular 2-Column Grid Skeleton */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-200/80 px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-rose-100" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4.5 w-32 rounded bg-slate-200" />
                      <Skeleton className="h-3 w-24 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                        <Skeleton className="h-8 w-8 rounded-lg bg-slate-200 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-full rounded bg-slate-200" />
                          <Skeleton className="h-2.5 w-1/2 rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-200/80 px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-indigo-100" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4.5 w-32 rounded bg-slate-200" />
                      <Skeleton className="h-3 w-24 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                        <Skeleton className="h-8 w-8 rounded-lg bg-slate-200 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-full rounded bg-slate-200" />
                          <Skeleton className="h-2.5 w-1/2 rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Latest Across Desks Skeleton */}
              <section className="space-y-5">
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


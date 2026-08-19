'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Newspaper, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import type { PostListItem } from '@/lib/types';
import { PostCard } from '@/components/PostCard';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';
import { formatPublishedAt, formatTimeAgoUpper } from '@/lib/format';
import { resolvePostImageUrl } from '@/lib/story-image';
import { decodeHtmlEntities } from '@/lib/sanitize';
import { MarketDeskOverview } from '@/components/MarketDeskOverview';

type Props = {
  category: string;
  posts: PostListItem[];
  total: number;
  listPage: number;
  totalPages: number;
  slugSegment: string;
};

export function CategoryDeskView({
  category,
  posts: initialPosts,
  total,
  slugSegment,
}: Props) {
  const currentLabel = categoryLabel(category);
  const [posts, setPosts] = useState<PostListItem[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length < total);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sync initial posts if server props change (e.g. route navigation)
  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialPosts.length < total);
  }, [initialPosts, total]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/posts?category=${encodeURIComponent(category)}&page=${nextPage}&limit=16`,
        { cache: 'no-store' },
      );
      if (res.ok) {
        const data = await res.json();
        const incoming: PostListItem[] = Array.isArray(data.posts) ? data.posts : [];

        if (incoming.length > 0) {
          setPosts((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            const fresh = incoming.filter((p) => !seen.has(p.id));
            const combined = [...prev, ...fresh];
            if (combined.length >= (data.total ?? total) || incoming.length < 16) {
              setHasMore(false);
            }
            return combined;
          });
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch {
      // Don't kill hasMore on temporary network glitch
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, category, total]);

  // Infinite Scroll Observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '400px',
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loadingMore]);

  const leadPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.length > 0 ? posts.slice(1) : [];
  const isMarketCategory =
    ['Stocks & Markets', 'Crypto', 'Banking & Economics', 'Business', 'stocks-markets', 'crypto', 'banking-economics'].includes(category) ||
    category.toLowerCase().includes('market') ||
    category.toLowerCase().includes('stock') ||
    category.toLowerCase().includes('crypto');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 2xl:max-w-[1440px]">
      {/* Dedicated Markets & Financial Intelligence Board */}
      {isMarketCategory && <MarketDeskOverview category={category} />}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Newspaper className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 font-display text-base font-bold text-slate-800">
            No stories published on this desk yet
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Check back shortly for incoming syndicated wires and breaking reports.
          </p>
          <Link
            href="/news"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            <span>Explore all news</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Lead Feature Spotlight */}
          {leadPost && (
            <section aria-label={`Lead ${currentLabel} Story`}>
              <Link
                href={`/news/${leadPost.slug}`}
                className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md sm:h-[220px] sm:grid-cols-12 sm:items-stretch"
              >
                {/* Image Column - Fixed & locked height */}
                <div className="relative h-48 w-full shrink-0 overflow-hidden bg-slate-100 sm:col-span-5 sm:h-full lg:col-span-4">
                  <RemoteStoryImage
                    src={resolvePostImageUrl(leadPost.image_url)}
                    alt={leadPost.title}
                    category={leadPost.category}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:hidden" />
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-300 backdrop-blur-md">
                      <Sparkles className="h-2.5 w-2.5 text-teal-300" />
                      Lead Feature
                    </span>
                  </div>
                </div>

                {/* Content Column - Locked height with flex-between */}
                <div className="flex h-full flex-col justify-between overflow-hidden p-4 sm:col-span-7 sm:p-5 lg:col-span-8 lg:p-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {currentLabel} Desk
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgoUpper(leadPost.published_at)}</span>
                      {leadPost.reading_time_minutes ? (
                        <>
                          <span>•</span>
                          <span>{leadPost.reading_time_minutes} min read</span>
                        </>
                      ) : null}
                    </div>

                    <h2 className="mt-1.5 font-display text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-teal-700 sm:text-lg lg:text-xl line-clamp-2">
                      {decodeHtmlEntities(leadPost.title)}
                    </h2>

                    {leadPost.excerpt && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                        {decodeHtmlEntities(leadPost.excerpt)}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-medium text-slate-500">
                      {formatPublishedAt(leadPost.published_at)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 transition-transform group-hover:translate-x-0.5">
                      <span>Read report</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* 2. 4-Column Magazine Grid with Infinite Scrolling */}
          {gridPosts.length > 0 && (
            <section aria-label={`${currentLabel} Stories Grid`}>
              {leadPost && (
                <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700">
                    Latest {currentLabel} Desk Wire
                  </h3>
                  <span className="text-[11px] font-medium tabular-nums text-slate-500">
                    Showing {posts.length} of {total.toLocaleString()} stories
                  </span>
                </div>
              )}

              <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {gridPosts.map((p, i) => (
                  <li key={`${p.id}-${i}`} className="min-w-0">
                    <PostCard post={p} gridCell index={i} compact />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3. Infinite Scroll Sentinel & Status Area */}
          <div ref={sentinelRef} className="pt-6 pb-2">
            {loadingMore && (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    Loading more {currentLabel} stories...
                  </span>
                </div>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-64 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
                    >
                      <div className="h-36 w-full rounded-xl bg-slate-200" />
                      <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="flex items-center justify-center gap-2 py-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>You&apos;re all caught up • All {posts.length} stories loaded</span>
                </div>
              </div>
            )}

            {hasMore && !loadingMore && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                >
                  <span>Load more stories</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

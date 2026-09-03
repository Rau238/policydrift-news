'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  Loader2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  FileQuestion,
  Image as ImageIcon,
} from 'lucide-react';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';
import { formatRelativeTime, decodeHtmlEntities } from '@/lib/format';
import { storyFallbackImageUrl } from '@/lib/story-image';

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  category: string;
  published_at: string;
  reading_time_minutes?: number;
  view_count?: number;
}

const POPULAR_TOPICS = [
  'India',
  'Cricket',
  'Markets',
  'Technology',
  'AI',
  'Politics',
  'World',
  'Economy',
  'Finance',
];

const DESKS = [
  { id: 'all', label: 'All Desks' },
  { id: 'politics', label: 'Politics' },
  { id: 'business', label: 'Markets & Business' },
  { id: 'technology', label: 'Technology' },
  { id: 'sports', label: 'Sports & Cricket' },
  { id: 'world', label: 'World' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'science', label: 'Science' },
];

export function SearchClient({
  initialQuery = '',
  initialCategory = 'all',
}: {
  initialQuery?: string;
  initialCategory?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  const executeSearch = useCallback(
    async (q: string, cat: string) => {
      setLoading(true);
      setHasSearched(true);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('search', q.trim());
        if (cat && cat !== 'all') params.set('category', cat);
        params.set('limit', '24');

        const res = await fetch(`/api/posts?${params.toString()}`);
        const data = await res.json();
        if (data && Array.isArray(data.posts)) {
          setPosts(data.posts);
          setTotal(data.total || data.posts.length);
        } else {
          setPosts([]);
          setTotal(0);
        }
      } catch (err) {
        console.error('Search failed:', err);
        setPosts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Search on initial load or URL change
  useEffect(() => {
    executeSearch(initialQuery, initialCategory);
  }, [initialQuery, initialCategory, executeSearch]);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category && category !== 'all') params.set('category', category);

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
    executeSearch(query, category);
  }

  function handleCategoryChange(newCat: string) {
    setCategory(newCat);
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (newCat && newCat !== 'all') params.set('category', newCat);

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
    executeSearch(query, newCat);
  }

  function handleTopicClick(topic: string) {
    setQuery(topic);
    const params = new URLSearchParams();
    params.set('q', topic);
    if (category && category !== 'all') params.set('category', category);

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
    executeSearch(topic, category);
  }

  function clearQuery() {
    setQuery('');
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
    executeSearch('', category);
  }

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="relative flex items-center rounded-2xl border border-slate-800 bg-[#0c1220]/95 p-2 shadow-2xl backdrop-blur-md focus-within:border-teal-500/80 transition"
      >
        <div className="pl-3 pr-2 text-teal-400">
          <Search size={20} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keywords, companies, leaders, topics, or breaking events..."
          className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder-slate-400 outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800 mr-1"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-950/60 hover:from-teal-400 hover:to-emerald-500 transition disabled:opacity-50 shrink-0"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <span>Search</span>}
        </button>
      </form>

      {/* Popular Topics Pill Cloud */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <TrendingUp size={13} className="text-amber-400" />
          <span>Popular Searches:</span>
        </span>
        {POPULAR_TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => handleTopicClick(topic)}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
              query.toLowerCase() === topic.toLowerCase()
                ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Desk Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-slate-800/80">
        {DESKS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => handleCategoryChange(d.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
              category === d.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            {d.id !== 'all' && <CategoryGlyph name={d.id} className="h-3 w-3" />}
            <span>{d.label}</span>
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          {loading ? (
            <span className="flex items-center gap-2 text-teal-400">
              <Loader2 size={13} className="animate-spin" />
              Searching database...
            </span>
          ) : hasSearched ? (
            <span>
              Found <strong className="text-white font-mono">{total}</strong> stories
              {query ? (
                <>
                  {' '}for &ldquo;<strong className="text-teal-300">{query}</strong>&rdquo;
                </>
              ) : (
                ' in recent archive'
              )}
            </span>
          ) : (
            <span>Showing recent stories</span>
          )}
        </div>
      </div>

      {/* Search Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-slate-800/60 bg-slate-900/40 animate-pulse"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-[#0c1220]/60 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-500 mb-4">
            <FileQuestion size={28} />
          </div>
          <h3 className="text-base font-bold text-white">No stories match your search</h3>
          <p className="mt-1 max-w-md text-xs text-slate-400">
            We couldn&apos;t find any published articles matching &ldquo;{query}&rdquo;. Try broader keywords, check your spelling, or browse by desk categories above.
          </p>
          <button
            onClick={clearQuery}
            className="mt-5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const titleDecoded = decodeHtmlEntities(post.title);
            const excerptDecoded = decodeHtmlEntities(post.excerpt || '');
            const imgSrc =
              post.image_url ||
              storyFallbackImageUrl({ title: post.title, category: post.category });

            return (
              <article
                key={post.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 transition hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-950/20"
              >
                <div>
                  {/* Article Thumbnail */}
                  <Link href={`/news/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-slate-900">
                    <img
                      src={imgSrc}
                      alt={titleDecoded}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = storyFallbackImageUrl({
                          title: post.title,
                          category: post.category,
                        });
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-teal-300 backdrop-blur-md border border-slate-700/60 uppercase">
                        <CategoryGlyph name={post.category} className="h-2.5 w-2.5" />
                        {categoryLabel(post.category)}
                      </span>
                    </div>
                  </Link>

                  {/* Article Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-500" />
                        {formatRelativeTime(post.published_at)}
                      </span>
                      {post.reading_time_minutes ? (
                        <>
                          <span>&bull;</span>
                          <span>{post.reading_time_minutes} min read</span>
                        </>
                      ) : null}
                    </div>

                    <h2 className="text-sm font-bold text-white line-clamp-2 group-hover:text-teal-300 transition leading-snug">
                      <Link href={`/news/${post.slug}`}>{titleDecoded}</Link>
                    </h2>

                    {excerptDecoded && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {excerptDecoded}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer link */}
                <div className="border-t border-slate-800/80 px-4 py-2.5 bg-slate-950/40 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-500">NewsFree365 Desk</span>
                  <Link
                    href={`/news/${post.slug}`}
                    className="flex items-center gap-1 font-bold text-teal-400 group-hover:text-teal-300 transition"
                  >
                    <span>Read Report</span>
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

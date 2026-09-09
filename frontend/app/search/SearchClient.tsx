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
  Filter,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';
import { formatRelativeTime, decodeHtmlEntities } from '@/lib/format';
import { cleanDisplayExcerpt } from '@/lib/article-body';
import { isBarrierOrAdImage } from '@/lib/story-image';
import { CategoryStoryPlaceholder } from '@/components/CategoryStoryPlaceholder';

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
  'Banking',
  'Economy',
  'Politics',
  'World',
  'Finance',
];

const DESKS = [
  { id: 'all', label: 'All Desks' },
  { id: 'politics', label: 'Politics' },
  { id: 'business', label: 'Markets & Business' },
  { id: 'Banking & Economics', label: 'Banking & Economics' },
  { id: 'technology', label: 'Technology' },
  { id: 'sports', label: 'Sports & Cricket' },
  { id: 'world', label: 'World' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'science', label: 'Science' },
  { id: 'crypto', label: 'Crypto' },
];

function SearchCard({ post }: { post: Post }) {
  const [imgFailed, setImgFailed] = useState(false);
  const titleDecoded = decodeHtmlEntities(post.title);
  const excerptDecoded = cleanDisplayExcerpt(post.excerpt, post.title);
  const hasValidImage = Boolean(post.image_url && !isBarrierOrAdImage(post.image_url) && !imgFailed);

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220]/90 transition-all duration-300 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-950/30 hover:-translate-y-0.5">
      <div>
        {/* Article Thumbnail */}
        <Link href={`/news/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-900">
          {hasValidImage ? (
            <img
              src={post.image_url!}
              alt={titleDecoded}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <CategoryStoryPlaceholder category={post.category} />
          )}

          {/* Floating Desk Badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-teal-300 backdrop-blur-md border border-slate-700/60 shadow-md uppercase tracking-wider">
              <CategoryGlyph name={post.category} className="h-3 w-3 text-teal-400" />
              <span>{categoryLabel(post.category)}</span>
            </span>
          </div>
        </Link>

        {/* Article Content */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-slate-500" />
              {formatRelativeTime(post.published_at)}
            </span>
            {post.reading_time_minutes ? (
              <>
                <span className="text-slate-600">&bull;</span>
                <span>{post.reading_time_minutes} min read</span>
              </>
            ) : null}
          </div>

          <h2 className="text-sm sm:text-base font-bold text-white line-clamp-2 group-hover:text-teal-300 transition-colors leading-snug">
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
      <div className="border-t border-slate-800/80 px-4 sm:px-5 py-3 bg-slate-950/50 flex items-center justify-between text-xs">
        <span className="text-[11px] font-semibold text-slate-500">NewsFree365 Desk</span>
        <Link
          href={`/news/${post.slug}`}
          className="flex items-center gap-1 font-bold text-teal-400 group-hover:text-teal-300 transition-colors"
        >
          <span>Read Report</span>
          <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

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
    <div className="space-y-8">
      {/* Command Center Hero Box */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#0e1628]/95 via-slate-900/80 to-slate-950/95 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-md">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Top Header Information */}
        <div className="relative mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
              <span className="text-xs font-black uppercase tracking-wider text-teal-400">
                Search & Real-time Archives
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Search Verified News & Global Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Find syndicated articles, breaking alerts, economic policy dispatches, and editorial desk analysis across NewsFree365.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-950/40 px-3.5 py-1.5 text-xs font-bold text-teal-300 shadow-xs">
              <ShieldCheck size={14} className="text-teal-400" />
              <span>112,000+ Stories Indexed</span>
            </div>
          </div>
        </div>

        {/* Search Command Bar */}
        <form
          onSubmit={handleFormSubmit}
          className="relative flex items-center rounded-2xl border border-slate-700/80 bg-[#070c18] p-2 shadow-2xl focus-within:border-teal-400 focus-within:shadow-[0_0_30px_rgba(20,184,166,0.25)] transition-all duration-300"
        >
          <div className="pl-4 pr-3 text-teal-400">
            <Search size={22} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keywords, companies, leaders, economic policies, ticker symbols..."
            className="w-full bg-transparent px-2 py-3 text-sm sm:text-base text-white placeholder-slate-400 outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="p-2 text-slate-400 hover:text-white transition rounded-xl hover:bg-slate-800 mr-2"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 mr-3 shrink-0">
            <span>Press ↵ Enter</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 px-6 sm:px-8 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-teal-950/80 hover:from-teal-400 hover:to-emerald-400 transition-all disabled:opacity-50 shrink-0 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </form>

        {/* Popular Topics Pill Cloud */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-1">
            <TrendingUp size={14} className="text-amber-400" />
            <span>Popular Searches:</span>
          </span>
          {POPULAR_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => handleTopicClick(topic)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                query.toLowerCase() === topic.toLowerCase()
                  ? 'border-teal-400 bg-teal-500/25 text-teal-200 shadow-sm shadow-teal-950/40'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Desk Category Filter Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-slate-800/80 pt-4">
          {DESKS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => handleCategoryChange(d.id)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                category === d.id
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-950/60 ring-1 ring-teal-400/40'
                  : 'text-slate-400 bg-slate-900/60 border border-slate-800/60 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {d.id !== 'all' && <CategoryGlyph name={d.id} className="h-3.5 w-3.5" />}
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 px-1">
        <div>
          {loading ? (
            <span className="flex items-center gap-2 text-teal-400 font-medium">
              <Loader2 size={14} className="animate-spin" />
              Searching indexed stories...
            </span>
          ) : hasSearched ? (
            <span>
              Found <strong className="text-white font-mono">{total.toLocaleString()}</strong> stories
              {query ? (
                <>
                  {' '}for &ldquo;<strong className="text-teal-300">{query}</strong>&rdquo;
                </>
              ) : (
                ' in recent archive'
              )}
            </span>
          ) : (
            <span>Showing recent stories across all desks</span>
          )}
        </div>

        {category !== 'all' && (
          <button
            onClick={() => handleCategoryChange('all')}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition"
          >
            Clear Desk Filter
          </button>
        )}
      </div>

      {/* Search Results Grid (Responsive 4-Column Layout) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 py-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl border border-slate-800/60 bg-slate-900/40 animate-pulse"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800/80 bg-[#0c1220]/60 p-16 text-center my-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-500 mb-4">
            <FileQuestion size={32} />
          </div>
          <h3 className="text-lg font-bold text-white">No stories match your search</h3>
          <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-400">
            We couldn&apos;t find any published articles matching &ldquo;{query}&rdquo;. Try broader keywords, check spelling, or browse by desk categories above.
          </p>
          <button
            onClick={clearQuery}
            className="mt-6 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition shadow-md"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <SearchCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

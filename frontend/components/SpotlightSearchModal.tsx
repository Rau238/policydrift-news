'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Loader2,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  Image as ImageIcon,
  Compass,
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
}

const TRENDING_TOPICS = [
  'India',
  'Cricket',
  'Markets',
  'Technology',
  'AI',
  'Politics',
  'World',
  'Economy',
];

const DESKS = [
  { id: 'all', label: 'All Desks' },
  { id: 'politics', label: 'Politics' },
  { id: 'business', label: 'Markets' },
  { id: 'technology', label: 'Tech' },
  { id: 'sports', label: 'Sports' },
  { id: 'world', label: 'World' },
];

export function SpotlightSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced live search
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim() && category === 'all') {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('search', query.trim());
        if (category !== 'all') params.set('category', category);
        params.set('limit', '8');

        const res = await fetch(`/api/posts?${params.toString()}`);
        const data = await res.json();
        if (data && Array.isArray(data.posts)) {
          setResults(data.posts);
          setSelectedIndex(0);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Spotlight search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, category, isOpen]);

  function handleSelectPost(post: Post) {
    onClose();
    router.push(`/news/${post.slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectPost(results[selectedIndex]);
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-black/80 backdrop-blur-2xl text-slate-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Spotlight Header Bar */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-4 py-3.5 bg-slate-950/60">
          {/* Mac window dots */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 border border-rose-600/60 cursor-pointer" onClick={onClose} />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 border border-amber-600/60" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 border border-emerald-600/60" />
          </div>

          <div className="text-teal-400 pl-1">
            {loading ? <Loader2 size={20} className="animate-spin text-teal-400" /> : <Search size={20} />}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search news..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-white placeholder-slate-400 outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X size={16} />
            </button>
          )}

          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span>ESC</span>
          </div>
        </div>

        {/* Desk Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-b border-slate-800/60 bg-slate-950/40 no-scrollbar">
          {DESKS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setCategory(d.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                category === d.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              {d.id !== 'all' && <CategoryGlyph name={d.id} className="h-3 w-3" />}
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-2 space-y-1 max-h-[55vh] no-scrollbar">
          {query.trim() || category !== 'all' ? (
            results.length === 0 && !loading ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-semibold text-white">No matching stories found</p>
                <p className="text-xs text-slate-400 mt-1">Try another keyword or search term.</p>
              </div>
            ) : (
              results.map((post, idx) => {
                const titleDecoded = decodeHtmlEntities(post.title);
                const isSelected = idx === selectedIndex;
                const imgSrc =
                  post.image_url ||
                  storyFallbackImageUrl({ title: post.title, category: post.category });

                return (
                  <div
                    key={post.id}
                    onClick={() => handleSelectPost(post)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 rounded-xl p-2.5 cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-teal-500/15 border border-teal-500/40 text-white shadow-md'
                        : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                    }`}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt=""
                        className="h-12 w-16 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                        <ImageIcon size={16} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-800/80 px-1.5 py-0.2 text-[9px] font-bold text-teal-300 uppercase border border-slate-700">
                          {categoryLabel(post.category)}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {formatRelativeTime(post.published_at)}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1 leading-snug">
                        {titleDecoded}
                      </h4>
                    </div>

                    <div className="text-slate-400 group-hover:text-teal-400 pr-1">
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-[11px] text-teal-400 font-mono">
                          <span>Open</span>
                          <CornerDownLeft size={12} />
                        </div>
                      ) : (
                        <ArrowRight size={14} className="text-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Default Trending & Suggestions View */
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2.5">
                  <TrendingUp size={13} className="text-amber-400" />
                  <span>Trending Searches:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setQuery(topic)}
                      className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-teal-500/50 hover:bg-teal-950/30 hover:text-teal-200 transition"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                  <Compass size={13} className="text-teal-400" />
                  <span>Browse Desks:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DESKS.filter((d) => d.id !== 'all').map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push(`/category/${d.id}`);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs font-semibold text-slate-300 hover:border-teal-500/40 hover:text-white transition"
                    >
                      <CategoryGlyph name={d.id} className="h-3.5 w-3.5 text-teal-400" />
                      <span>{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* macOS Spotlight Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-2 bg-slate-950/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300 border border-slate-700">↑</kbd>
              <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300 border border-slate-700">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1 font-mono">
              <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300 border border-slate-700">↵</kbd>
              Select
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Command size={12} />
            <span>Spotlight News Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}

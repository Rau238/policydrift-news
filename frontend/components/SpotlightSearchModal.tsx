'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Loader2,
  Clock,
  ArrowRight,
  CornerDownLeft,
  Image as ImageIcon,
} from 'lucide-react';
import { categoryLabel } from '@/lib/category-theme';
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

    if (!query.trim()) {
      // When empty, fetch latest top stories for instant preview
      fetch('/api/posts?limit=6')
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.posts)) {
            setResults(data.posts);
          }
        })
        .catch(() => {});
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set('search', query.trim());
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
    }, 120);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/95 shadow-2xl shadow-black/90 backdrop-blur-3xl text-slate-100 flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Animated Top Border Shimmer */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-teal-400/80 to-transparent animate-pulse" />

        {/* Sleek macOS Spotlight Header */}
        <div className="flex items-center gap-3.5 px-5 py-4 border-b border-slate-800/80 bg-slate-950/70">
          {/* Animated Futuristic Glowing Search Scanner Icon */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            {/* Ambient Pulse Ring */}
            <span className="absolute h-full w-full rounded-full bg-teal-500/20 animate-ping opacity-70" />
            
            {/* Spinning Gradient Border */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-500 p-[1.5px] animate-spin [animation-duration:4s]">
              <div className="h-full w-full rounded-full bg-slate-950" />
            </div>

            {/* Center Icon */}
            <div className="relative z-10 text-teal-400">
              {loading ? (
                <Loader2 size={18} className="animate-spin text-teal-300" />
              ) : (
                <Search size={18} className="text-teal-300" />
              )}
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search news..."
            className="w-full bg-transparent text-base sm:text-lg font-medium text-white placeholder-slate-400 outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X size={16} />
            </button>
          )}

          <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
            <span>ESC</span>
          </div>
        </div>

        {/* Stories Results List */}
        <div className="overflow-y-auto p-2 space-y-1 max-h-[52vh] no-scrollbar">
          {results.length === 0 && !loading ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-sm font-semibold text-white">No stories found</p>
              <p className="text-xs text-slate-400 mt-1">Try another search keyword.</p>
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
                  className={`flex items-center gap-3.5 rounded-2xl p-2.5 cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? 'bg-teal-500/20 border border-teal-500/40 text-white shadow-lg shadow-teal-950/40 translate-x-0.5'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  }`}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt=""
                      className="h-12 w-16 rounded-xl object-cover border border-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-16 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                      <ImageIcon size={16} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-bold text-teal-300 uppercase border border-slate-700">
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

                  <div className="text-slate-400 pr-1 shrink-0">
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
          )}
        </div>
      </div>
    </div>
  );
}

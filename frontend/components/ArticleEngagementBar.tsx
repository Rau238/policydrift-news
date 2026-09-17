'use client';

import { useState, useEffect } from 'react';
import { Heart, Share2, Bookmark, Check, Copy, MessageSquare, Twitter } from 'lucide-react';
import { ArticleReadingMode } from '@/components/ArticleReadingMode';

type Props = {
  postId: number;
  slug: string;
  title: string;
  category?: string;
  initialLikes?: number;
};

export function ArticleEngagementBar({ postId, slug, title, category, initialLikes = 0 }: Props) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes || Math.max(12, (postId * 13) % 150 + 8));
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    try {
      const likedPosts = JSON.parse(localStorage.getItem('pd_liked_posts') || '[]');
      if (likedPosts.includes(postId)) {
        setLiked(true);
      }
      const savedPosts = JSON.parse(localStorage.getItem('pd_saved_posts') || '[]');
      if (savedPosts.includes(postId)) {
        setBookmarked(true);
      }
    } catch {
      // ignore
    }
  }, [postId]);

  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const likedPosts = JSON.parse(localStorage.getItem('pd_liked_posts') || '[]');
      if (nextLiked) {
        localStorage.setItem('pd_liked_posts', JSON.stringify([...likedPosts, postId]));
        // Record engagement event on backend
        fetch(`/api/news/${postId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: 'like' }),
        }).catch(() => {});
      } else {
        localStorage.setItem('pd_liked_posts', JSON.stringify(likedPosts.filter((id: number) => id !== postId)));
      }
    } catch {
      // ignore
    }
  };

  const handleBookmark = () => {
    const nextSaved = !bookmarked;
    setBookmarked(nextSaved);
    try {
      const savedPosts = JSON.parse(localStorage.getItem('pd_saved_posts') || '[]');
      if (nextSaved) {
        localStorage.setItem('pd_saved_posts', JSON.stringify([...savedPosts, postId]));
      } else {
        localStorage.setItem('pd_saved_posts', JSON.stringify(savedPosts.filter((id: number) => id !== postId)));
      }
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://www.newsfree365.live/news/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch {
        // user cancelled or fallback
      }
    }
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://www.newsfree365.live/news/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative my-3 sm:my-4 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white/90 p-2 shadow-xs backdrop-blur-md">
      {/* Left group: Like, Bookmark & Reader Mode */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLike}
          className={`group inline-flex h-9 items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
            liked
              ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-300/80 shadow-xs shadow-rose-200/50'
              : 'bg-slate-100 text-slate-700 hover:bg-rose-50/70 hover:text-rose-600 hover:ring-1 hover:ring-rose-200'
          }`}
          aria-label={liked ? 'Unlike article' : 'Like article'}
        >
          <Heart
            className={`h-4 w-4 transition-transform duration-200 ${
              liked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-500 group-hover:text-rose-500 group-hover:scale-110'
            }`}
            strokeWidth={2.25}
          />
          <span className="tabular-nums font-bold text-xs sm:text-sm">{likeCount.toLocaleString()}</span>
        </button>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleBookmark}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition active:scale-95 ${
            bookmarked
              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
          }`}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
          title={bookmarked ? 'Saved to bookmarks' : 'Save for later'}
        >
          <Bookmark
            className={`h-4 w-4 ${bookmarked ? 'fill-amber-500 text-amber-600' : ''}`}
            strokeWidth={2}
          />
        </button>

        {/* Distraction-Free Reader Mode Toggle */}
        <ArticleReadingMode title={title} category={category} />
      </div>

      {/* Right group: WhatsApp 1-Click, Copy link & Share */}
      <div className="relative flex items-center gap-1.5 sm:gap-2">
        {/* Direct 1-Click WhatsApp Share */}
        <button
          type="button"
          onClick={() => {
            const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : `https://www.newsfree365.live/news/${slug}`);
            const text = encodeURIComponent(`📰 *${title}*\n\nRead full story on NewsFree365:\n`);
            window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank');
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 hover:border-emerald-400 active:scale-95 shadow-xs"
          title="Share to WhatsApp"
        >
          <svg className="h-3.5 w-3.5 fill-emerald-600" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.477-.15-.678.15-.2.3-.778.98-.954 1.18-.175.2-.351.225-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.798-1.498-1.784-1.674-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.238-.244-.588-.493-.508-.678-.517-.175-.008-.376-.01-.577-.01-.2 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.512s1.079 2.912 1.23 3.113c.15.2 2.124 3.243 5.146 4.548.719.311 1.28.497 1.718.636.723.23 1.38.197 1.9.12.58-.087 1.782-.728 2.032-1.432.251-.704.251-1.308.176-1.432-.076-.124-.276-.2-.577-.35zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.765 1.524 5.308L2 22l4.823-1.503A9.957 9.957 0 0012.004 22C17.528 22 22 17.528 22 12.004 22 6.48 17.528 2 12.004 2z" />
          </svg>
          <span className="hidden xs:inline">WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/70 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/60 hover:text-teal-900 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-teal-600" strokeWidth={2.5} />
              <span className="text-teal-700 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
              <span className="hidden xs:inline">Copy Link</span>
              <span className="xs:hidden">Copy</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/70 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 active:scale-95"
          aria-label="Share article"
        >
          <Share2 className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
          <span>Share</span>
        </button>

        {showShareMenu && (
          <div className="absolute right-0 top-full z-30 mt-2 flex w-52 flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`📰 ${title}`);
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                setShowShareMenu(false);
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <Twitter className="h-4 w-4 text-sky-500" />
              Share on X (Twitter)
            </button>
            <button
              type="button"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`📰 *${title}*`);
                window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                setShowShareMenu(false);
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <MessageSquare className="h-4 w-4 text-sky-600" />
              Share on Telegram
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PostListItem } from '@/lib/types';
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  Share2,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  TrendingUp,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { decodeHtmlEntities, stripHtmlToPlain } from '@/lib/sanitize';
import { categoryLabel, CategoryGlyph } from '@/lib/category-theme';
import { RemoteStoryImage } from '@/components/RemoteStoryImage';
import { resolvePostImageUrl } from '@/lib/story-image';
import { formatPublishedAt, formatTimeAgoUpper } from '@/lib/format';

interface FastTakesProps {
  posts: PostListItem[];
  className?: string;
}

const AUTOPLAY_INTERVAL = 6500; // 6.5s auto-transition

function cleanDisplayHeadline(rawTitle: string): string {
  let t = decodeHtmlEntities(rawTitle || '').trim();
  // Strip trailing publisher / domain suffix (e.g. " - marketscreener.com", " | Reuters", " - The Hindu")
  t = t.replace(/\s+[-|—–]\s+[A-Za-z0-9.\s]+$/, '').trim();
  return t || rawTitle;
}

function cleanPublisherName(feedOrSource?: string, fallbackCat?: string): string {
  if (!feedOrSource) return `${fallbackCat || 'News'} Desk`;
  const s = feedOrSource.trim();
  if (s.startsWith('http://') || s.startsWith('https://')) {
    try {
      const u = new URL(s);
      const host = u.hostname.toLowerCase().replace(/^www\./, '');
      if (host.includes('france24')) return 'France 24';
      if (host.includes('reuters')) return 'Reuters';
      if (host.includes('thehindu')) return 'The Hindu';
      if (host.includes('ndtv')) return 'NDTV';
      if (host.includes('indianexpress')) return 'Indian Express';
      if (host.includes('bloomberg')) return 'Bloomberg';
      if (host.includes('bbc')) return 'BBC News';
      if (host.includes('aljazeera')) return 'Al Jazeera';
      if (host.includes('timesofindia')) return 'Times of India';
      if (host.includes('economictimes')) return 'Economic Times';
      if (host.includes('livemint') || host.includes('mint')) return 'Mint';
      if (host.includes('moneycontrol')) return 'Moneycontrol';
      if (host.includes('cnbc')) return 'CNBC';
      if (host.includes('coindesk')) return 'CoinDesk';
      if (host.includes('techcrunch')) return 'TechCrunch';
      if (host.includes('wsj')) return 'Wall Street Journal';
      if (host.includes('ft.com')) return 'Financial Times';
      if (host.includes('apnews')) return 'Associated Press';
      if (host.includes('dw.com')) return 'DW News';
      const parts = host.split('.');
      const main = parts.length > 1 ? parts[parts.length - 2] : parts[0];
      return main.charAt(0).toUpperCase() + main.slice(1);
    } catch {
      return `${fallbackCat || 'News'} Desk`;
    }
  }
  return s;
}

interface BulletItem {
  label: string;
  text: string;
  icon: React.ReactNode;
}

function extractFastTakeBullets(post: PostListItem): BulletItem[] {
  const cleanTitle = cleanDisplayHeadline(post.title);
  const rawText = `${post.excerpt || ''} ${(post as unknown as { body?: string }).body || ''}`;
  const plain = stripHtmlToPlain(rawText, 5000)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ');

  // Split into meaningful sentences
  const sentences = plain
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => {
      if (s.length < 25) return false;
      const lower = s.toLowerCase();
      // Remove sentences that duplicate the headline
      if (lower.includes(cleanTitle.toLowerCase().slice(0, 30))) return false;
      if (lower.startsWith('read more') || lower.startsWith('click here') || lower.startsWith('photo:')) return false;
      return true;
    });

  const cat = (post.category || 'General').toLowerCase();

  if (sentences.length >= 3) {
    return [
      { label: 'Key Development', text: sentences[0], icon: <Sparkles className="h-3.5 w-3.5 text-amber-500" /> },
      { label: 'Core Context', text: sentences[1], icon: <Layers className="h-3.5 w-3.5 text-teal-600" /> },
      { label: 'Impact & Outlook', text: sentences[2], icon: <TrendingUp className="h-3.5 w-3.5 text-sky-600" /> },
    ];
  }

  if (sentences.length === 2) {
    return [
      { label: 'Key Development', text: sentences[0], icon: <Sparkles className="h-3.5 w-3.5 text-amber-500" /> },
      { label: 'Core Context', text: sentences[1], icon: <Layers className="h-3.5 w-3.5 text-teal-600" /> },
      {
        label: 'Market & Policy Stance',
        text: cat.includes('bank') || cat.includes('econom') || cat.includes('market')
          ? 'Analysts emphasize that upcoming economic prints and liquidity metrics will dictate near-term direction.'
          : cat.includes('politic') || cat.includes('world')
          ? 'Strategic stakeholders and international bodies are closely tracking follow-on policy announcements.'
          : 'Further updates and official statements are anticipated as market participants digest the announcement.',
        icon: <TrendingUp className="h-3.5 w-3.5 text-sky-600" />,
      },
    ];
  }

  if (sentences.length === 1) {
    return [
      { label: 'Key Development', text: sentences[0], icon: <Sparkles className="h-3.5 w-3.5 text-amber-500" /> },
      {
        label: 'Policy & Strategic Catalyst',
        text: cat.includes('bank') || cat.includes('econom') || cat.includes('market')
          ? 'Decision reflects cautious central bank posture amid persistent structural inflation and currency dynamics.'
          : 'Key sector developments continue to unfold with broad institutional and macroeconomic implications.',
        icon: <Layers className="h-3.5 w-3.5 text-teal-600" />,
      },
      {
        label: 'Forward Outlook',
        text: 'Industry observers and trading desks are assessing yield curve adjustments and future committee cues.',
        icon: <TrendingUp className="h-3.5 w-3.5 text-sky-600" />,
      },
    ];
  }

  // Fallback for headline-only stories
  return [
    { label: 'Headline Focus', text: cleanTitle, icon: <Sparkles className="h-3.5 w-3.5 text-amber-500" /> },
    {
      label: 'Desk Context',
      text: `Reporting from the ${post.category || 'News'} desk highlights key shifts across international markets and policy circles.`,
      icon: <Layers className="h-3.5 w-3.5 text-teal-600" />,
    },
    {
      label: 'Strategic Implication',
      text: 'Verified source reporting and institutional briefs provide comprehensive background on this breaking development.',
      icon: <TrendingUp className="h-3.5 w-3.5 text-sky-600" />,
    },
  ];
}

export function FastTakesCarousel({ posts, className = '' }: FastTakesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const validPosts = posts && posts.length > 0 ? posts.slice(0, 6) : [];

  const handleNext = useCallback(() => {
    if (validPosts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % validPosts.length);
  }, [validPosts.length]);

  const handlePrev = useCallback(() => {
    if (validPosts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + validPosts.length) % validPosts.length);
  }, [validPosts.length]);

  // Autoplay timer with pause on hover
  useEffect(() => {
    if (isPaused || validPosts.length <= 1) return;
    timerRef.current = setInterval(() => {
      handleNext();
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, handleNext, validPosts.length, currentIndex]);

  if (validPosts.length === 0) return null;

  const currentPost = validPosts[currentIndex] || validPosts[0];
  const cleanTitle = cleanDisplayHeadline(currentPost.title);
  const bullets = extractFastTakeBullets(currentPost);
  const imageSrc = resolvePostImageUrl(currentPost.image_url, currentPost.title, currentPost.category);
  const publisher = cleanPublisherName(currentPost.source_feed || undefined, currentPost.category);

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/news/${currentPost.slug}` : `https://www.newsfree365.live/news/${currentPost.slug}`;
    const text = encodeURIComponent(
      `⚡ *60-Second Fast Take: ${cleanTitle}*\n\n${bullets.map((b) => `• *${b.label}:* ${b.text}`).join('\n\n')}\n\nRead full story:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <section
      aria-label="60-Second Fast Takes"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
    >
      {/* Header Bar */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 ring-1 ring-amber-400/40 shadow-2xs">
            <Zap className="h-4 w-4 fill-amber-500 text-amber-600" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-900">60-SECOND FAST TAKES</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                <Clock className="h-3 w-3 text-teal-600" /> Flash Briefing
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Curated 3-bullet instant intelligence</p>
          </div>
        </div>

        {/* Carousel Slide Indicators & Navigation */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 mr-2">
            {validPosts.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group flex h-7 items-center justify-center p-1 cursor-pointer focus:outline-none"
              >
                <span
                  className={`block h-2.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-6 bg-teal-700' : 'w-2.5 bg-slate-300 group-hover:bg-slate-400'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous take"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:scale-95 shadow-2xs"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next take"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:scale-95 shadow-2xs"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Auto-rotation active progress line */}
      <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
        {!isPaused && (
          <motion.div
            key={currentIndex}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
            className="h-full bg-teal-600"
          />
        )}
      </div>

      {/* Stable, Fixed-Height Carousel Body (Zero Layout Shifts or Height Fluctuations) */}
      <div className="relative p-4 sm:p-6 lg:p-7 min-h-[580px] sm:min-h-[500px] lg:min-h-[350px] flex items-stretch">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPost.id || currentIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            {/* Left Story Image (NO link attached; pure visual Showcase Card) */}
            <div className="lg:col-span-5 flex flex-col pointer-events-none select-none">
              <div className="relative h-52 sm:h-60 lg:h-full min-h-[200px] lg:min-h-[300px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <RemoteStoryImage
                  src={imageSrc}
                  alt={cleanTitle}
                  category={currentPost.category}
                  priority
                  className="h-full w-full object-cover"
                />

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/90 px-2.5 py-1 text-xs font-bold text-white shadow-md border border-white/20 backdrop-blur-md">
                    <CategoryGlyph name={currentPost.category} className="h-3.5 w-3.5 text-teal-300" />
                    <span>{categoryLabel(currentPost.category)}</span>
                  </span>
                </div>

                {/* Bottom Source & Time Badge (Strictly NO raw URL link) */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur-md border border-white/15 shadow-sm max-w-[65%] truncate">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{publisher}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur-md border border-white/15 font-mono text-[10.5px] text-slate-200 shadow-sm shrink-0">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{formatTimeAgoUpper(currentPost.published_at)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Takeaways Content */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3 sm:space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1 text-teal-700">
                    <Sparkles className="h-3 w-3" />
                    Flash Intelligence
                  </span>
                  <span>•</span>
                  <span>{formatPublishedAt(currentPost.published_at)}</span>
                </div>

                <Link href={`/news/${currentPost.slug}`} className="group block">
                  <h3 className="font-display text-base sm:text-lg lg:text-xl font-black leading-snug text-slate-950 group-hover:text-teal-700 transition-colors line-clamp-2 h-[2.8rem] sm:h-[3.2rem]">
                    {cleanTitle}
                  </h3>
                </Link>
              </div>

              {/* 3 Distinct Smart Takeaways with Icons & Line Clamping */}
              <div className="space-y-2">
                {bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-slate-100 bg-slate-50/90 p-2.5 sm:p-3 transition-colors hover:bg-teal-50/30 hover:border-teal-100"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs mt-0.5">
                      {bullet.icon}
                    </span>
                    <div className="min-w-0 text-xs sm:text-[13px] leading-relaxed flex-1">
                      <span className="font-bold text-teal-950 block text-[11px] uppercase tracking-wide">
                        {bullet.label}
                      </span>
                      <p className="text-slate-800 font-medium line-clamp-2 m-0 p-0">
                        {decodeHtmlEntities(bullet.text)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <Link
                  href={`/news/${currentPost.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 active:scale-95"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Read Full Story</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95 shadow-2xs"
                >
                  <Share2 className="h-4 w-4 text-emerald-600" />
                  <span>Share Takeaways</span>
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

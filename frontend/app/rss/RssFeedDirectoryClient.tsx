'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Rss,
  Copy,
  Check,
  ExternalLink,
  Search,
  Sparkles,
  Zap,
  Globe,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { CategoryGlyph } from '@/lib/categories';

export type CategoryFeedItem = {
  key: string;
  name: string;
  slug: string;
  description: string;
  feedUrl: string;
  webUrl: string;
};

type Props = {
  masterFeedUrl: string;
  categories: CategoryFeedItem[];
};

export function RssFeedDirectoryClient({ masterFeedUrl, categories }: Props) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = async (url: string, slugKey: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slugKey);
      setTimeout(() => {
        setCopiedSlug((curr) => (curr === slugKey ? null : curr));
      }, 2500);
    } catch {
      // Fallback
      setCopiedSlug(null);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* ── Master Feed Spotlight Card ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/40 bg-gradient-to-br from-[#0c1626] via-[#09121d] to-[#060a12] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-300">
              <Radio size={13} className="text-teal-400 animate-pulse" />
              <span>PRIMARY AGGREGATE SYNDICATION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              All Headlines (Master RSS Feed)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consolidated real-time feed delivering every verified policy brief, market movement, geopolitical report,
              and breaking story across all desks as soon as published.
            </p>

            <div className="pt-1 font-mono text-xs text-teal-300/90 break-all select-all">
              <code>{masterFeedUrl}</code>
            </div>
          </div>

          {/* Master Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => copyToClipboard(masterFeedUrl, 'master')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-cyan-500 active:scale-95 transition-all cursor-pointer"
            >
              {copiedSlug === 'master' ? (
                <>
                  <Check size={16} className="text-white" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Master RSS URL</span>
                </>
              )}
            </button>

            <a
              href={masterFeedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition shadow-xs"
            >
              <span>View XML</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Category Search & Filter Bar ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Specialized Category Desks ({categories.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Subscribe exclusively to the beats, markets, or regions that matter to your workflow.
          </p>
        </div>

        {/* Search Filter */}
        <div className="relative min-w-[220px] sm:min-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category or topic…"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* ── Category Feed Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const isCopied = copiedSlug === cat.slug;

          return (
            <div
              key={cat.slug}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#080d19] p-4 sm:p-5 transition-all hover:border-teal-500/50 hover:bg-[#0a1120] hover:shadow-xl shadow-xs"
            >
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/80 text-teal-400 group-hover:border-teal-500/40 group-hover:text-teal-300 transition-colors">
                      <CategoryGlyph name={cat.name} className="h-4 w-4" />
                    </span>
                    <h4 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors truncate">
                      {cat.name}
                    </h4>
                  </div>

                  <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 border border-slate-800">
                    RSS 2.0
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Feed URL Display */}
                <div className="pt-1 font-mono text-[11px] text-slate-400 truncate select-all">
                  <code>{cat.feedUrl}</code>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(cat.feedUrl, cat.slug)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-xs'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                  title="Copy RSS URL to clipboard"
                >
                  {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{isCopied ? 'Copied' : 'Copy Feed'}</span>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={cat.feedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-teal-300 transition-colors"
                    title="Open XML feed"
                  >
                    <span>XML</span>
                    <ExternalLink size={11} />
                  </a>

                  <span className="text-slate-700">•</span>

                  <Link
                    href={cat.webUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                    title="Browse category web desk"
                  >
                    <span>Web</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── RSS Reader Setup Instructions ──────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-[#080d19] p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5">
          <Sparkles size={18} className="text-teal-400" />
          <h3 className="text-base font-bold text-white">How to Use RSS Feeds with NewsFree365</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1.5">
            <span className="font-bold text-white block">1. Modern Web Readers</span>
            <p className="text-slate-400 leading-relaxed">
              Paste any of our feed URLs directly into <strong>Feedly</strong>, <strong>Inoreader</strong>, or{' '}
              <strong>NewsBlur</strong>. Updates arrive within minutes of publication.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1.5">
            <span className="font-bold text-white block">2. Desktop & Mobile Apps</span>
            <p className="text-slate-400 leading-relaxed">
              Add feeds to native readers like <strong>NetNewsWire</strong>, <strong>Reeder</strong>, or{' '}
              <strong>Thunderbird</strong> for offline reading and push notifications.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-1.5">
            <span className="font-bold text-white block">3. Bot & Webhook Integrations</span>
            <p className="text-slate-400 leading-relaxed">
              Connect our feeds to <strong>Slack</strong>, <strong>Discord</strong>, or custom Telegram channels via
              standard RSS webhooks to alert trading or research teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

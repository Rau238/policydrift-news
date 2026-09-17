'use client';

import React from 'react';
import { Send, ArrowUpRight, CheckCircle2, ShieldCheck, Zap, Radio } from 'lucide-react';

interface CommunityJoinBannerProps {
  variant?: 'compact' | 'full' | 'inline';
  className?: string;
}

export function CommunityJoinBanner({ variant = 'full', className = '' }: CommunityJoinBannerProps) {
  const whatsappUrl = 'https://whatsapp.com/channel/0029Va9NewsFree365';
  const telegramUrl = 'https://t.me/newsfree365';

  if (variant === 'compact') {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950 p-4 text-white shadow-xl ${className}`}>
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-950">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-sm font-bold text-white">Live Newsroom Channel</h4>
              </div>
              <p className="text-xs text-slate-300">Instant breaking dispatches on WhatsApp & Telegram</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 active:scale-95"
            >
              <span>WhatsApp</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-sky-400 active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Telegram</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label="NewsFree365 Community Channels"
      className={`relative w-full min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6 lg:p-8 text-white shadow-xl sm:shadow-2xl ${className}`}
    >
      {/* Top subtle highlight line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 via-40% to-sky-400/60"
        aria-hidden
      />

      {/* Dynamic ambient color meshes */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 sm:h-56 sm:w-56 rounded-full bg-emerald-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-20 h-48 w-48 sm:h-56 sm:w-56 rounded-full bg-sky-600/15 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
        {/* Left Column: Headline & Active Proposition */}
        <div className="lg:col-span-7 space-y-2.5 sm:space-y-3.5 text-center lg:text-left">
          {/* Active Broadcast Status Header */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-emerald-300 backdrop-blur-md shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="tracking-wide uppercase text-[10px] sm:text-[11px]">Live Newsroom Broadcast</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold text-[10px] sm:text-[11px]">48.5K+ Readers</span>
          </div>

          <h3 className="font-display text-lg xs:text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug">
            Breaking News Sent <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">Directly To Your Phone</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Get instant market movers, policy notifications, and verified alerts delivered straight to your WhatsApp and Telegram feeds before algorithms filter them.
          </p>

          {/* Value Triggers */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-1.5 gap-x-3.5 pt-0.5 text-[11px] sm:text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1 text-emerald-300">
              <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Sub-Second Flash Alerts</span>
            </span>
            <span className="flex items-center gap-1 text-sky-300">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span>100% Privacy</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
              <span>Free Forever</span>
            </span>
          </div>
        </div>

        {/* Right Column: High-Converting Interactive CTA Cards */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:gap-3 justify-center">
          {/* WhatsApp Channel Card */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-2.5 sm:p-3.5 transition-all duration-300 hover:border-emerald-400 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-emerald-950/50 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-950 group-hover:scale-105 transition-transform">
                <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.477-.15-.678.15-.2.3-.778.98-.954 1.18-.175.2-.351.225-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.798-1.498-1.784-1.674-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.238-.244-.588-.493-.508-.678-.517-.175-.008-.376-.01-.577-.01-.2 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.512s1.079 2.912 1.23 3.113c.15.2 2.124 3.243 5.146 4.548.719.311 1.28.497 1.718.636.723.23 1.38.197 1.9.12.58-.087 1.782-.728 2.032-1.432.251-.704.251-1.308.176-1.432-.076-.124-.276-.2-.577-.35zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.947.558 3.765 1.524 5.308L2 22l4.823-1.503A9.957 9.957 0 0012.004 22C17.528 22 22 17.528 22 12.004 22 6.48 17.528 2 12.004 2z" />
                </svg>
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">Join WhatsApp</span>
                  <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] sm:text-[10px] font-semibold text-emerald-300">Instant</span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 truncate">1-Tap Follow • 29.4k Members</div>
              </div>
            </div>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* Telegram Channel Card */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-sky-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-2.5 sm:p-3.5 transition-all duration-300 hover:border-sky-400 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-sky-950/50 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-950 group-hover:scale-105 transition-transform">
                <Send className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">Join Telegram</span>
                  <span className="rounded bg-sky-500/20 px-1 py-0.2 text-[9px] sm:text-[10px] font-semibold text-sky-300">VIP</span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 truncate">Global Alerts • 19.1k Members</div>
              </div>
            </div>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600/20 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

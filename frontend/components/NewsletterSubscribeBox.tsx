'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface NewsletterSubscribeBoxProps {
  variant?: 'card' | 'inline' | 'compact';
  className?: string;
}

export function NewsletterSubscribeBox({
  variant = 'card',
  className = '',
}: NewsletterSubscribeBoxProps) {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'breaking'>('daily');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), frequency }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to subscribe. Please try again.');
      }

      setStatus({
        ok: true,
        message: 'You are subscribed to the NewsFree365 Daily Briefing! Check your inbox.',
      });
      setEmail('');
    } catch (err: any) {
      setStatus({
        ok: false,
        message: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`rounded-xl border border-teal-500/30 bg-teal-950/20 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2 text-teal-300 font-bold text-xs">
          <Mail size={15} />
          <span>Daily News Briefing</span>
        </div>
        <p className="text-[11px] text-slate-300 mb-3">
          Curated top intelligence & policy updates delivered to your inbox every morning.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-500 transition shrink-0"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : 'Join'}
            </button>
          </div>
          {status && (
            <p className={`text-[10px] ${status.ok ? 'text-emerald-400 font-semibold' : 'text-rose-400'}`}>
              {status.message}
            </p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 py-3.5 sm:px-6 sm:py-4 md:px-7 md:py-4.5 shadow-xl ${className}`}
    >
      {/* Top subtle highlight hairline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 via-50% to-transparent"
        aria-hidden
      />
      {/* Subtle corner ambient glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
        {/* Left: Headline & Description */}
        <div className="flex-1 min-w-0">


          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            Stay Ahead With The <span className="text-teal-400">NewsFree365 Briefing</span>
          </h3>

          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-1 sm:line-clamp-none">
            Curated daily intelligence & policy updates. No spam, 1-click unsubscribe anytime.
          </p>
        </div>

        {/* Right: Input Form & Micro Trust Row */}
        <div className="w-full md:w-auto md:min-w-[380px] lg:min-w-[420px] shrink-0">
          <form onSubmit={handleSubmit} className="space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-8 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-950/40 transition active:scale-95 disabled:opacity-60 shrink-0"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin text-white" />
                ) : (
                  <Send size={14} className="text-white" />
                )}
                <span>{loading ? 'Subscribing...' : 'Get Free Briefing'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-3 text-[10px] text-slate-400 px-0.5">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <ShieldCheck size={11} className="text-teal-400 shrink-0" /> Free Forever
              </span>
              <span className="text-slate-600 hidden sm:inline" aria-hidden>·</span>
              <span className="whitespace-nowrap">Daily Morning Delivery</span>
              <span className="text-slate-600 hidden sm:inline" aria-hidden>·</span>
              <span className="whitespace-nowrap">No Spam Ever</span>
            </div>
          </form>

          {status && (
            <div
              className={`mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${status.ok
                  ? 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                  : 'border border-rose-500/40 bg-red-950/40 text-rose-200'
                }`}
            >
              {status.ok ? (
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={13} className="text-rose-400 shrink-0" />
              )}
              <span className="text-[11px] font-medium">{status.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

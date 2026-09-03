'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MailX, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { siteName } from '@/lib/site';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const emailParam = searchParams?.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`)
        .then((res) => res.json())
        .then((data) => {
          setStatus({
            ok: data.ok,
            message: data.message || 'You have been unsubscribed.',
          });
        })
        .catch(() => {
          setStatus({
            ok: false,
            message: 'Failed to process unsubscribe. Please enter your email manually below.',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  async function handleManualUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/newsletter/unsubscribe?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      setStatus({
        ok: data.ok,
        message: data.message || 'You have been unsubscribed from all emails.',
      });
    } catch {
      setStatus({
        ok: false,
        message: 'Could not connect to server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 text-center space-y-5 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <MailX size={24} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">Newsletter Preferences</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your email subscription for {siteName}.
          </p>
        </div>

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 size={24} className="animate-spin text-teal-500" />
            <span className="text-xs">Processing unsubscribe request...</span>
          </div>
        ) : status ? (
          <div
            className={`rounded-xl p-4 text-xs ${
              status.ok
                ? 'border border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                : 'border border-rose-500/40 bg-rose-950/30 text-rose-200'
            }`}
          >
            {status.ok ? (
              <CheckCircle2 size={20} className="mx-auto text-emerald-400 mb-1" />
            ) : (
              <AlertCircle size={20} className="mx-auto text-rose-400 mb-1" />
            )}
            <p className="font-semibold">{status.message}</p>
          </div>
        ) : (
          <form onSubmit={handleManualUnsubscribe} className="space-y-3 text-left">
            <label className="block text-xs font-semibold text-slate-300">
              Enter your email address to unsubscribe:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition active:scale-95"
            >
              Unsubscribe from All Newsletters
            </button>
          </form>
        )}

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition"
          >
            <ArrowLeft size={14} />
            <span>Return to NewsFree365 Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={32} className="animate-spin text-teal-500" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}

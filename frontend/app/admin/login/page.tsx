'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShieldCheck, AlertCircle, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth', { credentials: 'include' });
        if (res.ok) {
          const data = (await res.json()) as { authenticated?: boolean };
          if (data.authenticated) {
            router.replace('/admin/dashboard');
            return;
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!secret.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ secret: secret.trim() }),
      });

      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Authentication failed. Please check the secret.');
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Network error — could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14]">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070b14] px-4 font-sans text-slate-100 antialiased">
      {/* Background Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(13,148,136,0.12),transparent_60%)]"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        {/* Top return link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-teal-300"
          >
            <ArrowLeft size={14} />
            <span>Return to Public Site</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#0c1220]/95 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-slate-700/30">
          {/* Logo Brand Header */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-xl shadow-teal-500/20 ring-1 ring-teal-400/40">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div className="mt-3.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
                PolicyDrift News Desk
              </p>
              <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
                Admin & Pipeline Access
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative secret key to continue
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300 shadow-sm animate-in fade-in">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="secret"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                <span>Admin Secret Key</span>
                <KeyRound size={13} className="text-slate-500" />
              </label>
              <div className="relative">
                <input
                  id="secret"
                  type={showSecret ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter admin secret..."
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40 disabled:opacity-50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !secret.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-950 transition hover:from-teal-500 hover:to-emerald-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {loading ? 'Authenticating…' : 'Access Admin Portal'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Restricted access. All actions are logged and authenticated.
        </p>
      </div>
    </div>
  );
}

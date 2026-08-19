import Link from 'next/link';
import { LegalPageShell, legalMetadata } from '@/components/LegalPageShell';
import { privacyEmail } from '@/lib/site-trust';
import {
  Cookie,
  ShieldCheck,
  Settings,
  Sliders,
  CheckCircle2,
  Trash2,
  Lock,
} from 'lucide-react';

export const metadata = legalMetadata(
  'Cookie Policy & Storage Transparency',
  'Learn how PolicyDrift utilizes essential cookies and client storage for security and preference persistence.',
);

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Cookie Settings & Policy"
      subtitle="Complete transparency regarding cookies, browser LocalStorage, and technical data storage across PolicyDrift."
      badge="Cookies & Storage"
      lastUpdated="August 2026"
      activePath="/cookies"
    >
      {/* Section 1: What Are Cookies */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Cookie className="h-5 w-5 text-amber-400 shrink-0" />
          <span>1. What Are Cookies & Local Storage?</span>
        </h2>
        <p>
          Cookies and LocalStorage are standard web technologies that allow websites to store small pieces of textual data on your browser. They enable web applications to remember your session state, maintain security headers, and preserve user preferences (like your preferred viewing mode).
        </p>
        <p>
          At PolicyDrift, we maintain a <strong>minimalist storage philosophy</strong>: we do not use cookies to profile you across the web or sell your browsing history to third-party ad networks.
        </p>
      </section>

      {/* Section 2: Categories of Storage We Use */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Sliders className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>2. How PolicyDrift Uses Storage</span>
        </h2>
        <div className="space-y-3 pt-1">
          {/* Strictly Necessary */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Strictly Necessary / Security (Always Active)</span>
              </span>
              <span className="rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold px-2 py-0.5 uppercase">
                Essential
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              These cookies and HTTP headers are required for core security, CSRF protection, and load balancing across reverse proxies. Without these tokens, authenticated administrative operations and secure edge routing cannot function.
            </p>
          </div>

          {/* Preference Storage */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-400" />
                <span>Reader Preference & LocalStorage</span>
              </span>
              <span className="rounded bg-purple-950 text-purple-400 border border-purple-800/60 text-[10px] font-bold px-2 py-0.5 uppercase">
                Functional
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stored directly in your browser&apos;s LocalStorage. Examples include remembering your active sports desk tab, dismissed announcements, or reader appearance modes. This data remains on your local device and is never transmitted to advertisers.
            </p>
          </div>

          {/* Performance & Stream Telemetry */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sky-400" />
                <span>Real-Time Stream State</span>
              </span>
              <span className="rounded bg-sky-950 text-sky-400 border border-sky-800/60 text-[10px] font-bold px-2 py-0.5 uppercase">
                Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Used by our live sports and market feeds to maintain persistent Server-Sent Event (SSE) connection health and prevent redundant polling cycles.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Managing & Clearing Cookies */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Trash2 className="h-5 w-5 text-rose-400 shrink-0" />
          <span>3. How to Manage Cookies in Your Browser</span>
        </h2>
        <p>
          You have full control over cookies and browser storage. You can configure your browser to block cookies or delete existing storage at any time:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-3.5">
            <span className="font-bold text-white block mb-1">Google Chrome / Brave</span>
            <span className="text-slate-400">Settings &rarr; Privacy and security &rarr; Third-party cookies / Site data</span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-3.5">
            <span className="font-bold text-white block mb-1">Apple Safari</span>
            <span className="text-slate-400">Preferences &rarr; Privacy &rarr; Manage Website Data / Block All Cookies</span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-3.5">
            <span className="font-bold text-white block mb-1">Mozilla Firefox</span>
            <span className="text-slate-400">Settings &rarr; Privacy & Security &rarr; Cookies and Site Data</span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-3.5">
            <span className="font-bold text-white block mb-1">Microsoft Edge</span>
            <span className="text-slate-400">Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 pt-2">
          Note: Blocking strictly necessary security tokens may affect certain authenticated operations on administrative panels.
        </p>
      </section>

      {/* Section 4: Contact */}
      <section className="space-y-3 pt-6 border-t border-white/[0.08]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>4. Inquiries & Updates</span>
        </h2>
        <p>
          We periodically review this policy to reflect new web standards and privacy regulations. If you have questions regarding our cookie practices, reach our compliance team at{' '}
          <a href={`mailto:${privacyEmail()}`} className="font-semibold text-emerald-400 hover:underline">
            {privacyEmail()}
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}

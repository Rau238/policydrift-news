'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

const STORAGE_KEY = 'newsfree365_cookie_consent';

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if consent has already been given or declined
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Show banner only after user starts interacting with the page (or after extended idle)
        const onUserAction = () => {
          setVisible(true);
          cleanup();
        };

        const timer = setTimeout(() => {
          setVisible(true);
        }, 10000);

        const cleanup = () => {
          clearTimeout(timer);
          window.removeEventListener('scroll', onUserAction);
          window.removeEventListener('pointerdown', onUserAction);
          window.removeEventListener('keydown', onUserAction);
        };

        window.addEventListener('scroll', onUserAction, { passive: true, once: true });
        window.addEventListener('pointerdown', onUserAction, { passive: true, once: true });
        window.addEventListener('keydown', onUserAction, { passive: true, once: true });

        return cleanup;
      }
    } catch {
      // In case localStorage is blocked/restricted
      setVisible(false);
    }
  }, []);

  // Listen for custom event to re-open consent settings from footer
  useEffect(() => {
    function handleOpenConsent() {
      setVisible(true);
    }
    window.addEventListener('open-cookie-consent', handleOpenConsent);
    return () => window.removeEventListener('open-cookie-consent', handleOpenConsent);
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: 'accepted', timestamp: new Date().toISOString() }));
    } catch (e) {
      console.warn('Could not save cookie consent:', e);
    }
    setVisible(false);
  };

  const handleDeclineAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: 'declined', timestamp: new Date().toISOString() }));
    } catch (e) {
      console.warn('Could not save cookie consent:', e);
    }
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 inset-x-0 z-50 animate-in fade-in slide-in-from-bottom-6 duration-300"
    >
      {/* Container with Ambient Radial Glows & Glassmorphism */}
      <div className="relative border-t border-slate-700/60 bg-[#060a12]/95 backdrop-blur-xl shadow-[0_-12px_40px_rgba(0,0,0,0.7)]">
        {/* Subtle Ambient Radial Lighting Strips */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-60"
        >
          <div className="absolute -left-20 -top-20 h-56 w-72 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="absolute -right-20 -top-20 h-56 w-72 rounded-full bg-cyan-600/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 2xl:max-w-[1440px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            {/* Left Column: Heading + Descriptive Text */}
            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  We value your privacy
                </h3>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-4xl">
                We and our partners use cookies and similar technologies to understand how you use our site and to show you
                personalized advertisements on other platforms. By clicking &quot;Accept All,&quot; you consent to these
                technologies for advertising, analytics and retargeting. Click &quot;Decline All&quot; to opt out of
                non-essential cookies. You can learn more in our{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-white underline underline-offset-2 hover:text-cyan-300 transition-colors"
                >
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="/cookies"
                  className="font-medium text-white underline underline-offset-2 hover:text-cyan-300 transition-colors"
                >
                  Cookie Policy
                </Link>
                .
              </p>
            </div>

            {/* Right Column: Accept All (White Pill) + Decline All */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-row md:flex-col lg:flex-row md:items-end lg:items-center">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-initial rounded-full bg-white px-6 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-md shadow-white/10 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Accept All
              </button>

              <button
                type="button"
                onClick={handleDeclineAll}
                className="text-xs font-semibold text-slate-400 hover:text-white underline underline-offset-2 sm:no-underline sm:hover:underline transition-colors px-2 py-1 cursor-pointer whitespace-nowrap"
              >
                Decline All
              </button>

              {/* Close Button on Top Right (Mobile/Tablet accessibility) */}
              <button
                type="button"
                onClick={handleDeclineAll}
                className="md:hidden text-slate-400 hover:text-white p-1 ml-auto"
                aria-label="Dismiss cookie notice"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, X, CheckCircle2 } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushSubscriptionPrompt() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);

      // Register the service worker
      navigator.serviceWorker.register('/sw.js').then(async (registration) => {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          setIsSubscribed(true);
        } else {
          // Check if user dismissed prompt previously
          const dismissed = localStorage.getItem('newsfree365_push_prompt_dismissed');
          if (!dismissed && Notification.permission === 'default') {
            const timer = setTimeout(() => setShowPrompt(true), 4000);
            return () => clearTimeout(timer);
          }
        }
      }).catch((err) => console.log('[Push] SW registration notice:', err));
    }
  }, []);

  async function handleSubscribe() {
    if (!isSupported) return;
    setLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setShowPrompt(false);
        setLoading(false);
        return;
      }

      const vapidKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        'BEOxX5FHHjs0jtdI7RSFK7xEtr_osf5BneU-xTVjAftofmu5eS-xST7kdJOcGSJgLTOycyS-NEf9bque6LWlIYo';

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Save to MySQL database via backend API
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      setShowPrompt(false);
    } catch (err) {
      console.error('[Push] Subscription failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    setShowPrompt(false);
    try {
      localStorage.setItem('newsfree365_push_prompt_dismissed', 'true');
    } catch {}
  }

  if (!isSupported) return null;

  return (
    <>
      {/* Floating Prompt Toast on First Visit */}
      {showPrompt && !isSubscribed && (
        <div className="fixed bottom-5 left-5 z-50 max-w-sm rounded-2xl border border-teal-500/40 bg-slate-950/95 p-4 text-slate-100 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-inner">
              <BellRing size={20} className="animate-bounce" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">Breaking News Alerts</h4>
                <button onClick={handleDismiss} className="text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-300">
                Get instant notifications for major political, market, and breaking headlines.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:from-teal-400 hover:to-emerald-500 transition active:scale-95"
                >
                  {loading ? 'Subscribing...' : 'Allow Alerts'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

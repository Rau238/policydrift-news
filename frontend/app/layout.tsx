import type { Metadata, Viewport } from 'next';
import { Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteJsonLd } from '@/components/SiteJsonLd';
import { PwaSplash } from '@/components/PwaSplash';
import { PushSubscriptionPrompt } from '@/components/PushSubscriptionPrompt';
import { storyFallbackImageUrl } from '@/lib/story-image';
import { absoluteUrl, publicSiteOrigin, siteDescription, siteName } from '@/lib/site';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMarketsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-markets-mono',
  display: 'swap',
});

const defaultOgImage = storyFallbackImageUrl();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0f766e' },
    { media: '(prefers-color-scheme: dark)', color: '#042f2e' },
  ],
  colorScheme: 'dark light',
};

/** Google AdSense publisher ID; override with NEXT_PUBLIC_ADSENSE_CLIENT in .env if needed. */
const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || 'ca-pub-1508845535613236';

/** AdSense often returns 403 on localhost / unreviewed origins; load the script only in production. */
const loadAdsenseScript =
  process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ADSENSE_DISABLED !== 'true';

/** Optional search engine domain verifications from environment */
const yandexVerify = process.env.NEXT_PUBLIC_YANDEX_VERIFY?.trim();
const pinterestVerify = process.env.NEXT_PUBLIC_PINTEREST_VERIFY?.trim();
const facebookVerify = process.env.NEXT_PUBLIC_FACEBOOK_VERIFY?.trim();

/** Google Analytics 4 (GA4) measurement ID (e.g. G-XXXXXXXXXX) */
const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

/** OneSignal Web Push App ID */
const oneSignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteOrigin()),
  title: {
    default: `${siteName}: Policy & news, clearly told`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  icons: {
    icon: [{ url: '/images/brand-logo.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  keywords: [
    'news',
    'breaking news',
    'world news',
    'policy',
    'politics',
    'business news',
    'markets',
    'India news',
    'RSS news',
    siteName,
  ],
  authors: [{ name: siteName, url: absoluteUrl('/') }],
  creator: siteName,
  alternates: {
    types: {
      'application/rss+xml': absoluteUrl('/feed.xml'),
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName,
    title: siteName,
    description: siteDescription,
    url: absoluteUrl('/'),
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${siteName} default cover`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: 'UuJfYPFX1nOwmN_mg9mUJEZQkJQWqSsLxHmF3VJF63c',
    ...(yandexVerify ? { yandex: yandexVerify } : {}),
  },
  /** Search Engine Verification & Integration tags */
  other: {
    'google-site-verification': 'UuJfYPFX1nOwmN_mg9mUJEZQkJQWqSsLxHmF3VJF63c',
    'msvalidate.01': 'EC6F809ECC7199497C4F3C2803B7C39C',
    ...(yandexVerify ? { 'yandex-verification': yandexVerify } : {}),
    ...(pinterestVerify ? { 'p:domain_verify': pinterestVerify } : {}),
    ...(facebookVerify ? { 'facebook-domain-verification': facebookVerify } : {}),
    ...(loadAdsenseScript ? { 'google-adsense-account': adsenseClient } : {}),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jetbrainsMarketsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-paper font-sans antialiased text-ink">
        {gaId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            />
            <script
              id="ga-init"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        ) : null}

        {oneSignalAppId ? (
          <>
            <script
              src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
              defer
            />
            <script
              id="onesignal-init"
              dangerouslySetInnerHTML={{
                __html: `
                  window.OneSignalDeferred = window.OneSignalDeferred || [];
                  OneSignalDeferred.push(async function(OneSignal) {
                    await OneSignal.init({
                      appId: '${oneSignalAppId}',
                      allowLocalhostAsSecureOrigin: true,
                    });
                  });
                `,
              }}
            />
          </>
        ) : null}

        {loadAdsenseScript ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <SiteJsonLd />
        <PwaSplash />
        <PushSubscriptionPrompt />
        <SiteHeader />
        <main className="min-w-0 max-w-[100vw] flex-1 overflow-x-clip">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}


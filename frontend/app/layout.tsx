import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Lora, Outfit } from 'next/font/google';
import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteJsonLd } from '@/components/SiteJsonLd';
import { storyFallbackImageUrl } from '@/lib/story-image';
import { absoluteUrl, publicSiteOrigin, siteDescription, siteName } from '@/lib/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-news',
  display: 'swap',
});

const outfitMarkets = Outfit({
  subsets: ['latin'],
  variable: '--font-markets',
  display: 'swap',
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
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

/** Google AdSense publisher ID — override with NEXT_PUBLIC_ADSENSE_CLIENT in .env if needed. */
const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || 'ca-pub-1508845535613236';

/** AdSense often returns 403 on localhost / unreviewed origins; load the script only in production. */
const loadAdsenseScript =
  process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ADSENSE_DISABLED !== 'true';

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteOrigin()),
  title: {
    default: `${siteName}: Policy & news, clearly told`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
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
  /** Bing Webmaster Tools — explicit meta name="msvalidate.01" */
  other: {
    'msvalidate.01': 'EC6F809ECC7199497C4F3C2803B7C39C',
    ...(loadAdsenseScript ? { 'google-adsense-account': adsenseClient } : {}),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${outfitMarkets.variable} ${jetbrainsMarketsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-paper font-sans antialiased text-ink">
        {loadAdsenseScript ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <SiteJsonLd />
        <SiteHeader />
        <main className="min-w-0 flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

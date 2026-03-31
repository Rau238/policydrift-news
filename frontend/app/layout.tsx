import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
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

const defaultOgImage = storyFallbackImageUrl();

/** Google AdSense publisher ID — override with NEXT_PUBLIC_ADSENSE_CLIENT in .env if needed. */
const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || 'ca-pub-1508845535613236';

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteOrigin()),
  title: {
    default: `${siteName} — Policy & news, clearly told`,
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
  other: {
    'google-adsense-account': adsenseClient,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper font-sans antialiased text-ink">
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`}
          crossOrigin="anonymous"
        />
        <SiteJsonLd />
        <SiteHeader />
        <main className="min-w-0 flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

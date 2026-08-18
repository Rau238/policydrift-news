'use client';

import { ExternalLink, ShieldCheck, Newspaper } from 'lucide-react';
import { formatPublishedAt } from '@/lib/format';

type Props = {
  originalUrl: string;
  sourceFeed?: string | null;
  author?: string | null;
  publishedAt: string;
  category: string;
};

function getPublisherName(url: string, sourceFeed?: string | null): { name: string; domain: string } {
  let domain = 'publisher.com';
  try {
    if (url) {
      const u = new URL(url);
      domain = u.hostname.replace(/^www\./, '');
    }
  } catch {
    // fallback
  }

  if (sourceFeed && !sourceFeed.startsWith('http')) {
    return { name: sourceFeed, domain };
  }

  const domainMap: Record<string, string> = {
    'bbc.co.uk': 'BBC News',
    'bbc.com': 'BBC News',
    'reuters.com': 'Reuters',
    'theguardian.com': 'The Guardian',
    'apnews.com': 'Associated Press',
    'bloomberg.com': 'Bloomberg',
    'aljazeera.com': 'Al Jazeera',
    'thehindu.com': 'The Hindu',
    'indianexpress.com': 'The Indian Express',
    'ndtv.com': 'NDTV News',
    'timesofindia.indiatimes.com': 'Times of India',
    'hindustantimes.com': 'Hindustan Times',
    'livemint.com': 'Mint',
    'moneycontrol.com': 'Moneycontrol',
    'cnbc.com': 'CNBC',
    'ft.com': 'Financial Times',
    'wsj.com': 'The Wall Street Journal',
    'nytimes.com': 'The New York Times',
    'washingtonpost.com': 'The Washington Post',
    'techcrunch.com': 'TechCrunch',
    'coindesk.com': 'CoinDesk',
    'cointelegraph.com': 'CoinTelegraph',
  };

  const matched = domainMap[domain.toLowerCase()];
  if (matched) {
    return { name: matched, domain };
  }

  const basePart = domain.split('.')[0];
  const name = basePart.charAt(0).toUpperCase() + basePart.slice(1);
  return { name: name || domain, domain };
}

export function PublisherCreditCard({
  originalUrl,
  sourceFeed,
  author,
  publishedAt,
}: Props) {
  const { name: publisherName } = getPublisherName(originalUrl, sourceFeed);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      {/* Publisher Details */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600/10 text-teal-700 ring-1 ring-teal-600/20">
          <Newspaper className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm sm:text-base">
              {publisherName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <ShieldCheck className="h-3 w-3" /> Verified Source
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {author ? `Reported by ${author} · ` : ''}Syndicated via official news feed
          </p>
        </div>
      </div>

      {/* Direct Outbound Action */}
      <div className="flex shrink-0 items-center">
        <a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-teal-900/10 transition hover:bg-accent-dark active:scale-95 sm:w-auto"
        >
          <span>Read Full Story on {publisherName}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

import { absoluteUrl, publicSiteOrigin, siteDescription, siteName } from '@/lib/site';
import { contactEmail, curatorName, curatorProfileUrl } from '@/lib/site-trust';

/**
 * Embed JSON-LD in `<script type="application/ld+json">` safely escaping XML/HTML parser triggers.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** ISO-8601 for schema.org dates (Google News / Discover friendly). */
export function toSchemaDate(iso?: string | null): string {
  if (!iso) return new Date().toISOString();
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString();
}

const orgId = () => `${absoluteUrl('/')}#organization`;
const websiteId = () => `${absoluteUrl('/')}#website`;

/**
 * Global Site Graph Schema (NewsMediaOrganization + WebSite + SearchAction)
 */
export function siteGraphJsonLd() {
  const base = absoluteUrl('/');
  const logo = absoluteUrl('/images/brand-logo.svg');
  const mail = contactEmail();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': orgId(),
        name: siteName,
        url: base,
        logo: {
          '@type': 'ImageObject',
          url: logo,
          width: 512,
          height: 512,
        },
        description: siteDescription,
        publishingPrinciples: absoluteUrl('/editorial'),
        correctionsPolicy: absoluteUrl('/editorial'),
        ethicsPolicy: absoluteUrl('/editorial'),
        sameAs: [
          'https://twitter.com/policydrift',
          'https://linkedin.com/company/policydrift',
          'https://www.youtube.com/@policydrift',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'editorial',
          email: mail || 'policy.drift.yt@gmail.com',
          availableLanguage: ['English', 'Hindi'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId(),
        url: base,
        name: siteName,
        description: siteDescription,
        inLanguage: 'en-US',
        publisher: { '@id': orgId() },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${base}search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

function resolveAbsoluteImage(src: string | null | undefined): string | undefined {
  if (!src?.trim()) return undefined;
  const s = src.trim();
  if (s.startsWith('https://') || s.startsWith('http://')) return s;
  const base = publicSiteOrigin().replace(/\/$/, '');
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${base}${path}`;
}

/**
 * Article Page Rich JSON-LD (NewsArticle + BreadcrumbList + SpeakableSpecification)
 * Fully compliant with Google News 2025/2026, Google AI Overviews, and Bing Copilot.
 */
export function newsArticleJsonLd(params: {
  url: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  imageUrls: string[];
  section: string;
  articleBody?: string;
  keyTakeaways?: string;
  sourceFeed?: string | null;
  curatorPerson?: { name: string; url?: string; imageSrc?: string | null };
}) {
  const {
    url,
    title,
    description,
    datePublished,
    dateModified,
    imageUrls,
    section,
    articleBody,
    keyTakeaways,
    curatorPerson,
  } = params;

  const validImages = imageUrls.filter(Boolean);
  const primaryImage = validImages[0] || absoluteUrl('/api/og');

  const authors: object[] = [
    {
      '@type': 'Person',
      name: curatorPerson?.name?.trim() || curatorName(),
      jobTitle: 'News Desk Editor',
      url: curatorPerson?.url || curatorProfileUrl(),
      worksFor: { '@id': orgId() },
    },
    {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      url: absoluteUrl('/'),
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `${url}#article`,
        headline: title,
        description,
        datePublished: toSchemaDate(datePublished),
        dateModified: toSchemaDate(dateModified),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        image: validImages.length > 0 ? validImages : [primaryImage],
        thumbnailUrl: primaryImage,
        author: authors,
        publisher: {
          '@type': 'NewsMediaOrganization',
          '@id': orgId(),
          name: siteName,
          url: absoluteUrl('/'),
          logo: {
            '@type': 'ImageObject',
            url: absoluteUrl('/images/brand-logo.svg'),
            width: 512,
            height: 512,
          },
          publishingPrinciples: absoluteUrl('/editorial'),
        },
        articleSection: section,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['#article-headline', '#article-takeaways', '#article-excerpt'],
        },
        ...(keyTakeaways ? { abstract: keyTakeaways } : {}),
        ...(articleBody ? { articleBody } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'News',
            item: absoluteUrl('/news'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: section,
            item: absoluteUrl(`/news/${section.toLowerCase().replace(/\s+/g, '-')}`),
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: title,
            item: url,
          },
        ],
      },
    ],
  };
}

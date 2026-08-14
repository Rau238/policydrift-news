import { absoluteUrl, publicSiteOrigin, siteDescription, siteName } from '@/lib/site';
import { contactEmail } from '@/lib/site-trust';

/**
 * Embed JSON-LD in `<script type="application/ld+json">` without breaking the HTML parser.
 * Any `<` in strings (e.g. `articleBody` from feeds) must become `\u003c` or a literal `</script>` in text
 * closes the script tag and drops NewsArticle from the DOM (SEO tools then only see layout schema).
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** ISO-8601 for schema.org dates (Google News / Discover friendly). */
export function toSchemaDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString();
}

const orgId = () => `${absoluteUrl('/')}#organization`;
const websiteId = () => `${absoluteUrl('/')}#website`;

export function siteGraphJsonLd() {
  const base = absoluteUrl('/');
  const logo = absoluteUrl('/images/brand-logo.svg');
  const mail = contactEmail();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId(),
        name: siteName,
        url: base,
        logo: { '@type': 'ImageObject', url: logo },
        description: siteDescription,
        ...(mail ? { email: mail } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId(),
        url: base,
        name: siteName,
        description: siteDescription,
        inLanguage: 'en-US',
        publisher: { '@id': orgId() },
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

export function newsArticleJsonLd(params: {
  url: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  imageUrls: string[];
  section: string;
  articleBody?: string;
  /** Person curator for E-E-A-T (alongside org). */
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
    curatorPerson,
  } = params;
  const primary = imageUrls[0];
  const orgAuthor = { '@type': 'Organization', name: siteName, url: absoluteUrl('/') };
  const authors: object[] = [];
  if (curatorPerson?.name?.trim()) {
    const img = resolveAbsoluteImage(curatorPerson.imageSrc ?? null);
    authors.push({
      '@type': 'Person',
      name: curatorPerson.name.trim(),
      ...(curatorPerson.url ? { url: curatorPerson.url } : {}),
      ...(img ? { image: { '@type': 'ImageObject', url: img } } : {}),
    });
  }
  authors.push(orgAuthor);
  const authorField = authors.length === 1 ? authors[0] : authors;
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
        author: authorField,
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: { '@type': 'ImageObject', url: absoluteUrl('/images/brand-logo.svg') },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: imageUrls,
        ...(primary ? { thumbnailUrl: primary } : {}),
        articleSection: section,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        ...(articleBody ? { articleBody } : {}),
      },
      {
        '@type': 'BreadcrumbList',
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
            name: title,
            item: url,
          },
        ],
      },
    ],
  };
}

import { absoluteUrl, siteDescription, siteName } from '@/lib/site';

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
  const logo = absoluteUrl('/icon.svg');
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

export function newsArticleJsonLd(params: {
  url: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  imageUrls: string[];
  section: string;
  articleBody?: string;
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
  } = params;
  const primary = imageUrls[0];
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
        author: { '@type': 'Organization', name: siteName, url: absoluteUrl('/') },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.svg') },
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
            name: 'Newsroom',
            item: absoluteUrl('/blog'),
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

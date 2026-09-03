import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/admin/login'],
      },
      {
        userAgent: [
          'Googlebot',
          'Googlebot-News',
          'Google-Extended',
          'Bingbot',
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Applebot',
          'Applebot-Extended',
          'Twitterbot',
          'facebookexternalhit',
          'WhatsApp',
        ],
        allow: '/',
        disallow: ['/admin/', '/api/admin/'],
      },
    ],
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/news-sitemap.xml')],
    host: absoluteUrl('/'),
  };
}

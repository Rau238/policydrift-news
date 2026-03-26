import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = absoluteUrl('/');
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}sitemap.xml`,
  };
}

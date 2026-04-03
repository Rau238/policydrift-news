'use client';

import { useParams } from 'next/navigation';
import {
  NewsArticleSkeleton,
  NewsCategoryHubSkeleton,
} from '@/components/NewsCategoryHubSkeleton';
import { categoryFromSlug } from '@/lib/category-routes';

function slugFromParams(slug: string | string[] | undefined): string {
  if (slug == null) return '';
  return Array.isArray(slug) ? (slug[0] ?? '') : slug;
}

export default function NewsSlugLoading() {
  const params = useParams();
  const slug = slugFromParams(params?.slug as string | string[] | undefined);
  if (slug && categoryFromSlug(slug)) {
    return <NewsCategoryHubSkeleton />;
  }
  return <NewsArticleSkeleton />;
}

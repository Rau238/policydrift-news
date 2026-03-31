'use client';

import { useParams } from 'next/navigation';
import {
  NewsArticleSkeleton,
  NewsCategoryHubSkeleton,
} from '@/components/NewsCategoryHubSkeleton';
import { categoryFromSlug } from '@/lib/category-routes';

export default function NewsSlugLoading() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  if (slug && categoryFromSlug(slug)) {
    return <NewsCategoryHubSkeleton />;
  }
  return <NewsArticleSkeleton />;
}

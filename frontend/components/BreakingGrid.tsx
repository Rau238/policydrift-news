import type { PostListItem } from '@/lib/types';
import { PostCard } from '@/components/PostCard';

const MAX_VISIBLE = 6;

type Props = { posts: PostListItem[] };

/**
 * Breaking stories in a responsive grid — no horizontal scrolling.
 */
export function BreakingGrid({ posts }: Props) {
  if (!posts.length) return null;
  const slice = posts.slice(0, MAX_VISIBLE);

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 max-lg:gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {slice.map((p, i) => (
        <li key={p.id} className="min-w-0">
          <PostCard post={p} priority={i < 3} gridCell index={i} />
        </li>
      ))}
    </ul>
  );
}

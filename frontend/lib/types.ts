export type PostListItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  view_count: number;
  published_at: string;
  created_at: string;
};

export type PostDetail = PostListItem & {
  body: string;
  original_url: string;
  source_feed: string | null;
  updated_at: string;
};

export type CategoryRow = { category: string; count: number };

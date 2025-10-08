-- =====================================================
-- NEWS WEBSITE DATABASE SCHEMA
-- =====================================================
-- This file contains the complete database schema for the news website
-- including tables, relationships, RLS policies, functions, and triggers.
-- 
-- Setup Instructions:
-- 1. Go to your Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Execute the SQL
-- 4. Enable Row Level Security on all tables
-- 5. Create storage buckets: 'avatars' and 'articles'
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article Tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.article_tags (
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (article_id, tag_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('comment', 'like', 'follow', 'article', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- Articles indexes
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON public.articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article_id ON public.bookmarks(article_id);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_article_id ON public.likes(article_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment article view count
CREATE OR REPLACE FUNCTION increment_article_views(article_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.articles 
    SET view_count = view_count + 1 
    WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get article with author and category details
CREATE OR REPLACE FUNCTION get_article_details(article_slug TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    status TEXT,
    is_featured BOOLEAN,
    view_count INTEGER,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    author_id UUID,
    author_username TEXT,
    author_full_name TEXT,
    author_avatar TEXT,
    category_id UUID,
    category_name TEXT,
    category_slug TEXT,
    category_color TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.slug,
        a.excerpt,
        a.content,
        a.featured_image,
        a.status,
        a.is_featured,
        a.view_count,
        a.published_at,
        a.created_at,
        a.updated_at,
        u.id AS author_id,
        u.username AS author_username,
        u.full_name AS author_full_name,
        u.avatar_url AS author_avatar,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        c.color AS category_color
    FROM public.articles a
    LEFT JOIN public.users u ON a.author_id = u.id
    LEFT JOIN public.categories c ON a.category_id = c.id
    WHERE a.slug = article_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles"
    ON public.users FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Categories policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Tags policies
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
CREATE POLICY "Anyone can view tags"
    ON public.tags FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
CREATE POLICY "Admins can manage tags"
    ON public.tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Articles policies
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
CREATE POLICY "Anyone can view published articles"
    ON public.articles FOR SELECT
    USING (status = 'published' OR author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can create articles" ON public.articles;
CREATE POLICY "Authors can create articles"
    ON public.articles FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own articles" ON public.articles;
CREATE POLICY "Authors can update own articles"
    ON public.articles FOR UPDATE
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Authors can delete own articles" ON public.articles;
CREATE POLICY "Authors can delete own articles"
    ON public.articles FOR DELETE
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Article Tags policies
DROP POLICY IF EXISTS "Anyone can view article tags" ON public.article_tags;
CREATE POLICY "Anyone can view article tags"
    ON public.article_tags FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authors can manage own article tags" ON public.article_tags;
CREATE POLICY "Authors can manage own article tags"
    ON public.article_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.articles
            WHERE id = article_id AND author_id = auth.uid()
        )
    );

-- Comments policies
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
CREATE POLICY "Anyone can view approved comments"
    ON public.comments FOR SELECT
    USING (is_approved = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Bookmarks policies
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view own bookmarks"
    ON public.bookmarks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can manage own bookmarks"
    ON public.bookmarks FOR ALL
    USING (auth.uid() = user_id);

-- Likes policies
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
CREATE POLICY "Anyone can view likes"
    ON public.likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON public.likes;
CREATE POLICY "Users can manage own likes"
    ON public.likes FOR ALL
    USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
-- Note: Create these buckets manually in Supabase Dashboard > Storage
-- OR use the commands below if you have admin access
-- 
-- 1. Create bucket: 'avatars'
--    - Public: Yes
--    - File size limit: 2MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- 2. Create bucket: 'article-images'
--    - Public: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp

-- Create avatars bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[];

-- Create article-images bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[];

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Clean up any existing policies
DROP POLICY IF EXISTS "Avatars: Public SELECT" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Authenticated INSERT" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Authenticated UPDATE" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Authenticated DELETE" ON storage.objects;
DROP POLICY IF EXISTS "Articles: Public SELECT" ON storage.objects;
DROP POLICY IF EXISTS "Articles: Authenticated INSERT" ON storage.objects;
DROP POLICY IF EXISTS "Articles: Authenticated UPDATE" ON storage.objects;
DROP POLICY IF EXISTS "Articles: Authenticated DELETE" ON storage.objects;

-- AVATARS BUCKET POLICIES
-- Allow everyone to view avatars
CREATE POLICY "Avatars: Public SELECT"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Avatars: Authenticated INSERT"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update avatars
CREATE POLICY "Avatars: Authenticated UPDATE"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to delete avatars
CREATE POLICY "Avatars: Authenticated DELETE"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- ARTICLE IMAGES BUCKET POLICIES
-- Allow everyone to view article images
CREATE POLICY "Articles: Public SELECT"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Allow authenticated users to upload article images
CREATE POLICY "Articles: Authenticated INSERT"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');

-- Allow authenticated users to update article images
CREATE POLICY "Articles: Authenticated UPDATE"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images')
WITH CHECK (bucket_id = 'article-images');

-- Allow authenticated users to delete article images
CREATE POLICY "Articles: Authenticated DELETE"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images');

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Insert default categories
INSERT INTO public.categories (name, slug, description, color, icon) VALUES
    ('Technology', 'technology', 'Latest in tech and innovation', '#3B82F6', '💻'),
    ('Business', 'business', 'Business news and insights', '#10B981', '💼'),
    ('Sports', 'sports', 'Sports news and updates', '#EF4444', '⚽'),
    ('Entertainment', 'entertainment', 'Movies, music, and more', '#8B5CF6', '🎬'),
    ('Science', 'science', 'Scientific discoveries', '#06B6D4', '🔬'),
    ('Health', 'health', 'Health and wellness', '#F59E0B', '❤️'),
    ('Politics', 'politics', 'Political news and analysis', '#6366F1', '🏛️'),
    ('World', 'world', 'Global news coverage', '#EC4899', '🌍')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tags
INSERT INTO public.tags (name, slug) VALUES
    ('Breaking News', 'breaking-news'),
    ('Trending', 'trending'),
    ('Analysis', 'analysis'),
    ('Opinion', 'opinion'),
    ('Interview', 'interview'),
    ('Investigation', 'investigation')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the schema setup:
--
-- 1. Check all tables:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' ORDER BY table_name;
--
-- 2. Check RLS status:
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public';
--
-- 3. Check policies:
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies WHERE schemaname = 'public';
--
-- 4. Test article query:
-- SELECT * FROM get_article_details('sample-article-slug');
--
-- =====================================================
-- END OF SCHEMA
-- =====================================================

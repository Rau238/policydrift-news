-- ========================================================================
-- MASTER SUPABASE SCHEMA FOR NEWS WEBSITE
-- ========================================================================
-- This file contains the complete database schema including:
-- - Core tables (users, articles, categories, tags, comments, etc.)
-- - Site settings and configuration
-- - Newsletter subscribers
-- - Storage buckets and policies
-- - Row Level Security (RLS) policies
-- - Functions and triggers
-- - Initial seed data
--
-- SETUP INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Execute the SQL
-- 4. Verify all tables are created successfully
-- ========================================================================

-- ========================================================================
-- EXTENSIONS
-- ========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ========================================================================
-- CORE TABLES
-- ========================================================================

-- Profiles table (extends Supabase auth.users)
-- Note: In schema, it's called 'profiles' not 'users' to match the codebase
CREATE TABLE IF NOT EXISTS public.profiles (
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
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
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
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('comment', 'like', 'follow', 'article', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- SITE CONFIGURATION TABLES
-- ========================================================================

-- Site Settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Site Identity
    site_name TEXT DEFAULT 'NewsHub',
    site_logo TEXT,
    tagline TEXT DEFAULT 'Your source for the latest news',
    description TEXT DEFAULT 'Stay informed with the latest news and stories from around the world',
    
    -- SEO Settings
    seo_title TEXT DEFAULT 'NewsHub - Latest News & Stories',
    seo_description TEXT DEFAULT 'Get the latest breaking news, analysis, and stories from around the world',
    seo_keywords TEXT[] DEFAULT ARRAY['news', 'breaking news', 'latest news', 'world news'],
    og_image TEXT,
    
    -- Social Media Links
    facebook_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    github_url TEXT,
    
    -- Contact Information
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    
    -- Additional Settings
    google_analytics_id TEXT,
    newsletter_enabled BOOLEAN DEFAULT true,
    comments_enabled BOOLEAN DEFAULT true,
    custom_css TEXT,
    custom_js TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Newsletter Subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- INDEXES FOR PERFORMANCE
-- ========================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

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
CREATE INDEX IF NOT EXISTS idx_articles_views_count ON public.articles(views_count DESC);

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

-- Site Settings indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_at ON public.site_settings(updated_at);

-- Newsletter indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON public.newsletter_subscribers(subscribed_at);

-- ========================================================================
-- FUNCTIONS
-- ========================================================================

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for site settings updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment article view count
CREATE OR REPLACE FUNCTION increment_article_views(article_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.articles 
    SET views_count = views_count + 1 
    WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================================
-- TRIGGERS
-- ========================================================================

-- Updated_at triggers for core tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
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

-- Site settings trigger
DROP TRIGGER IF EXISTS site_settings_updated_at_trigger ON public.site_settings;
CREATE TRIGGER site_settings_updated_at_trigger
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles: Anyone can view" ON public.profiles;
CREATE POLICY "Profiles: Anyone can view"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Profiles: Users can update own" ON public.profiles;
CREATE POLICY "Profiles: Users can update own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: Users can insert own" ON public.profiles;
CREATE POLICY "Profiles: Users can insert own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Categories policies
DROP POLICY IF EXISTS "Categories: Anyone can view" ON public.categories;
CREATE POLICY "Categories: Anyone can view"
    ON public.categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Categories: Admins can manage" ON public.categories;
CREATE POLICY "Categories: Admins can manage"
    ON public.categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Tags policies
DROP POLICY IF EXISTS "Tags: Anyone can view" ON public.tags;
CREATE POLICY "Tags: Anyone can view"
    ON public.tags FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Tags: Admins can manage" ON public.tags;
CREATE POLICY "Tags: Admins can manage"
    ON public.tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Articles policies
DROP POLICY IF EXISTS "Articles: Anyone can view published" ON public.articles;
CREATE POLICY "Articles: Anyone can view published"
    ON public.articles FOR SELECT
    USING (status = 'published' OR author_id = auth.uid());

DROP POLICY IF EXISTS "Articles: Authors can create" ON public.articles;
CREATE POLICY "Articles: Authors can create"
    ON public.articles FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Articles: Authors can update own" ON public.articles;
CREATE POLICY "Articles: Authors can update own"
    ON public.articles FOR UPDATE
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Articles: Authors can delete own" ON public.articles;
CREATE POLICY "Articles: Authors can delete own"
    ON public.articles FOR DELETE
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Article Tags policies
DROP POLICY IF EXISTS "Article Tags: Anyone can view" ON public.article_tags;
CREATE POLICY "Article Tags: Anyone can view"
    ON public.article_tags FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Article Tags: Authors can manage own" ON public.article_tags;
CREATE POLICY "Article Tags: Authors can manage own"
    ON public.article_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.articles
            WHERE id = article_id AND author_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Comments policies
DROP POLICY IF EXISTS "Comments: Anyone can view approved" ON public.comments;
CREATE POLICY "Comments: Anyone can view approved"
    ON public.comments FOR SELECT
    USING (is_approved = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Comments: Authenticated users can create" ON public.comments;
CREATE POLICY "Comments: Authenticated users can create"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Comments: Users can update own" ON public.comments;
CREATE POLICY "Comments: Users can update own"
    ON public.comments FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Comments: Users can delete own" ON public.comments;
CREATE POLICY "Comments: Users can delete own"
    ON public.comments FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Bookmarks policies
DROP POLICY IF EXISTS "Bookmarks: Users can view own" ON public.bookmarks;
CREATE POLICY "Bookmarks: Users can view own"
    ON public.bookmarks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Bookmarks: Users can manage own" ON public.bookmarks;
CREATE POLICY "Bookmarks: Users can manage own"
    ON public.bookmarks FOR ALL
    USING (auth.uid() = user_id);

-- Likes policies
DROP POLICY IF EXISTS "Likes: Anyone can view" ON public.likes;
CREATE POLICY "Likes: Anyone can view"
    ON public.likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Likes: Users can manage own" ON public.likes;
CREATE POLICY "Likes: Users can manage own"
    ON public.likes FOR ALL
    USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Notifications: Users can view own" ON public.notifications;
CREATE POLICY "Notifications: Users can view own"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notifications: Users can update own" ON public.notifications;
CREATE POLICY "Notifications: Users can update own"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notifications: System can create" ON public.notifications;
CREATE POLICY "Notifications: System can create"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- Site Settings policies
DROP POLICY IF EXISTS "Site Settings: Anyone can view" ON public.site_settings;
CREATE POLICY "Site Settings: Anyone can view" 
    ON public.site_settings 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Site Settings: Only admins can create" ON public.site_settings;
CREATE POLICY "Site Settings: Only admins can create" 
    ON public.site_settings 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Site Settings: Only admins can update" ON public.site_settings;
CREATE POLICY "Site Settings: Only admins can update" 
    ON public.site_settings 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Site Settings: Only admins can delete" ON public.site_settings;
CREATE POLICY "Site Settings: Only admins can delete" 
    ON public.site_settings 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Newsletter Subscribers policies
DROP POLICY IF EXISTS "Newsletter: Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Newsletter: Anyone can subscribe" 
    ON public.newsletter_subscribers 
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Newsletter: Only admins can view all" ON public.newsletter_subscribers;
CREATE POLICY "Newsletter: Only admins can view all" 
    ON public.newsletter_subscribers 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Newsletter: Only admins can manage" ON public.newsletter_subscribers;
CREATE POLICY "Newsletter: Only admins can manage" 
    ON public.newsletter_subscribers 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Newsletter: Only admins can delete" ON public.newsletter_subscribers;
CREATE POLICY "Newsletter: Only admins can delete" 
    ON public.newsletter_subscribers 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================================================
-- STORAGE BUCKETS
-- ========================================================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    -- Avatars bucket (2MB limit)
    (
        'avatars',
        'avatars',
        true,
        2097152,
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
    ),
    -- Article images bucket (5MB limit)
    (
        'article-images',
        'article-images',
        true,
        5242880,
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
    ),
    -- Site settings bucket (2MB limit)
    (
        'site-settings',
        'site-settings',
        true,
        2097152,
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
    )
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ========================================================================
-- STORAGE POLICIES
-- ========================================================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Avatars: Public SELECT" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Authenticated INSERT" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Authenticated UPDATE" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Authenticated DELETE" ON storage.objects;
DROP POLICY IF EXISTS "Articles: Public SELECT" ON storage.objects;
DROP POLICY IF EXISTS "Articles: Authenticated INSERT" ON storage.objects;
DROP POLICY IF EXISTS "Articles: Authenticated UPDATE" ON storage.objects;
DROP POLICY IF EXISTS "Articles: Authenticated DELETE" ON storage.objects;
DROP POLICY IF EXISTS "Site Settings: Public SELECT" ON storage.objects;
DROP POLICY IF EXISTS "Site Settings: Authenticated INSERT" ON storage.objects;
DROP POLICY IF EXISTS "Site Settings: Admins UPDATE" ON storage.objects;
DROP POLICY IF EXISTS "Site Settings: Admins DELETE" ON storage.objects;

-- AVATARS BUCKET POLICIES
CREATE POLICY "Avatars: Public SELECT"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Avatars: Authenticated INSERT"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Avatars: Authenticated UPDATE"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Avatars: Authenticated DELETE"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ARTICLE IMAGES BUCKET POLICIES
CREATE POLICY "Articles: Public SELECT"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "Articles: Authenticated INSERT"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Articles: Authenticated UPDATE"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

CREATE POLICY "Articles: Authenticated DELETE"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

-- SITE SETTINGS BUCKET POLICIES
CREATE POLICY "Site Settings: Public SELECT"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-settings');

CREATE POLICY "Site Settings: Authenticated INSERT"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-settings' AND auth.role() = 'authenticated');

CREATE POLICY "Site Settings: Admins UPDATE"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'site-settings' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Site Settings: Admins DELETE"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'site-settings' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ========================================================================
-- INITIAL SEED DATA
-- ========================================================================

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

-- Insert default site settings
INSERT INTO public.site_settings (
    site_name,
    tagline,
    description,
    seo_title,
    seo_description,
    seo_keywords,
    newsletter_enabled,
    comments_enabled
) VALUES (
    'NewsHub',
    'Your source for the latest news',
    'Stay informed with the latest news and stories from around the world',
    'NewsHub - Latest News & Stories',
    'Get the latest breaking news, analysis, and stories from around the world',
    ARRAY['news', 'breaking news', 'latest news', 'world news', 'current events'],
    true,
    true
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- VERIFICATION QUERIES
-- ========================================================================
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
-- 4. Check storage buckets:
-- SELECT id, name, public FROM storage.buckets;
--
-- 5. Check storage policies:
-- SELECT policyname, cmd FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects';
--
-- ========================================================================
-- END OF MASTER SCHEMA
-- ========================================================================

-- ========================================================================
-- COMPLETE SUPABASE SCHEMA FOR NEWS WEBSITE
-- ========================================================================
-- This is the single source of truth for the database schema.
-- It includes everything needed to set up your news website:
-- 
-- ✅ Core tables (profiles, articles, categories, tags, comments)
-- ✅ Extended site settings (80+ dynamic content fields)
-- ✅ Newsletter subscribers
-- ✅ Storage buckets and policies
-- ✅ Row Level Security (RLS) policies for public access
-- ✅ Functions and triggers
-- ✅ Indexes for performance
-- ✅ Initial seed data
--
-- SETUP INSTRUCTIONS:
-- 1. Create a new Supabase project at https://supabase.com
-- 2. Go to SQL Editor in your Supabase Dashboard
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" to execute
-- 5. Verify success (you should see "Schema setup completed!" message)
--
-- IMPORTANT: Run this on a fresh database or after backing up existing data
-- ========================================================================

-- ========================================================================
-- PART 1: EXTENSIONS
-- ========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ========================================================================
-- PART 2: CORE TABLES
-- ========================================================================

-- Profiles table (extends Supabase auth.users)
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
-- PART 3: SITE SETTINGS TABLE (EXTENDED WITH 80+ FIELDS)
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Core Site Identity
    site_name TEXT DEFAULT 'NewsHub',
    site_logo TEXT,
    tagline TEXT DEFAULT 'Your source for the latest news',
    description TEXT DEFAULT 'Stay informed with the latest news and stories',
    
    -- SEO Settings
    seo_title TEXT DEFAULT 'NewsHub - Latest News & Stories',
    seo_description TEXT DEFAULT 'Get the latest breaking news and stories',
    seo_keywords TEXT[] DEFAULT ARRAY['news', 'breaking news', 'latest news'],
    og_image TEXT,
    
    -- Social Media Links
    facebook_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    github_url TEXT,
    
    -- Basic Contact Information
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    
    -- Feature Toggles
    google_analytics_id TEXT,
    newsletter_enabled BOOLEAN DEFAULT true,
    comments_enabled BOOLEAN DEFAULT true,
    rss_enabled BOOLEAN DEFAULT true,
    
    -- Custom Code
    custom_css TEXT,
    custom_js TEXT,
    
    -- Company Information
    company_name TEXT,
    company_legal_name TEXT,
    company_registration_number TEXT,
    company_founded_year INTEGER,
    company_mission TEXT,
    company_vision TEXT,
    company_values JSONB DEFAULT '[]'::jsonb,
    
    -- About Us Content
    about_title TEXT DEFAULT 'About Us',
    about_subtitle TEXT,
    about_story TEXT,
    about_hero_image TEXT,
    
    -- Extended Contact Information
    contact_name TEXT,
    support_email TEXT,
    press_email TEXT,
    advertising_email TEXT,
    editorial_email TEXT,
    newsroom_email TEXT,
    office_hours TEXT,
    timezone TEXT DEFAULT 'America/New_York',
    contact_form_enabled BOOLEAN DEFAULT true,
    
    -- Structured Address Fields
    street_address TEXT,
    street_address_line_2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'United States',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Legal & Privacy
    privacy_policy_url TEXT,
    terms_of_service_url TEXT,
    cookie_policy_url TEXT,
    copyright_notice TEXT DEFAULT '© 2025 NewsHub. All rights reserved.',
    legal_entity_name TEXT,
    legal_jurisdiction TEXT,
    legal_governing_law TEXT,
    privacy_last_updated DATE,
    terms_last_updated DATE,
    dpo_name TEXT,
    dpo_email TEXT,
    license_type TEXT,
    disclaimer TEXT,
    
    -- Social Media Extended
    tiktok_url TEXT,
    discord_url TEXT,
    reddit_url TEXT,
    pinterest_url TEXT,
    mastodon_url TEXT,
    threads_url TEXT,
    
    -- Analytics & Tracking
    google_tag_manager_id TEXT,
    facebook_pixel_id TEXT,
    hotjar_id TEXT,
    clarity_id TEXT,
    
    -- Email Configuration
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_username TEXT,
    smtp_password TEXT,
    smtp_from_email TEXT,
    smtp_from_name TEXT,
    
    -- Appearance Settings
    theme_primary_color TEXT DEFAULT '#3B82F6',
    theme_secondary_color TEXT DEFAULT '#10B981',
    font_family TEXT DEFAULT 'Inter',
    logo_width INTEGER DEFAULT 180,
    logo_height INTEGER DEFAULT 60,
    
    -- Content Settings
    articles_per_page INTEGER DEFAULT 12,
    enable_featured_articles BOOLEAN DEFAULT true,
    show_author_info BOOLEAN DEFAULT true,
    show_reading_time BOOLEAN DEFAULT true,
    enable_article_reactions BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- ========================================================================
-- PART 4: INDEXES FOR PERFORMANCE
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
-- PART 5: FUNCTIONS
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
-- PART 6: TRIGGERS
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
-- PART 7: ROW LEVEL SECURITY (RLS) POLICIES
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

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Profiles: Anyone can view" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Users can update own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Users can insert own" ON public.profiles;
DROP POLICY IF EXISTS "Categories: Anyone can view" ON public.categories;
DROP POLICY IF EXISTS "Categories: Admins can manage" ON public.categories;
DROP POLICY IF EXISTS "Tags: Anyone can view" ON public.tags;
DROP POLICY IF EXISTS "Tags: Admins can manage" ON public.tags;
DROP POLICY IF EXISTS "Articles: Anyone can view published" ON public.articles;
DROP POLICY IF EXISTS "Articles: Authors can create" ON public.articles;
DROP POLICY IF EXISTS "Articles: Authors can update own" ON public.articles;
DROP POLICY IF EXISTS "Articles: Authors can delete own" ON public.articles;
DROP POLICY IF EXISTS "Article Tags: Anyone can view" ON public.article_tags;
DROP POLICY IF EXISTS "Article Tags: Authors can manage own" ON public.article_tags;
DROP POLICY IF EXISTS "Comments: Anyone can view approved" ON public.comments;
DROP POLICY IF EXISTS "Comments: Authenticated users can create" ON public.comments;
DROP POLICY IF EXISTS "Comments: Users can update own" ON public.comments;
DROP POLICY IF EXISTS "Comments: Users can delete own" ON public.comments;
DROP POLICY IF EXISTS "Bookmarks: Users can view own" ON public.bookmarks;
DROP POLICY IF EXISTS "Bookmarks: Users can manage own" ON public.bookmarks;
DROP POLICY IF EXISTS "Likes: Anyone can view" ON public.likes;
DROP POLICY IF EXISTS "Likes: Users can manage own" ON public.likes;
DROP POLICY IF EXISTS "Notifications: Users can view own" ON public.notifications;
DROP POLICY IF EXISTS "Notifications: Users can manage own" ON public.notifications;
DROP POLICY IF EXISTS "Site Settings: Anyone can view" ON public.site_settings;
DROP POLICY IF EXISTS "Site Settings: Admins can manage" ON public.site_settings;
DROP POLICY IF EXISTS "Newsletter: Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter: Anyone can view own" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter: Admins can manage" ON public.newsletter_subscribers;

-- Profiles policies
CREATE POLICY "Profiles: Anyone can view"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Profiles: Users can update own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Profiles: Users can insert own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories: Anyone can view"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Categories: Admins can manage"
    ON public.categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Tags policies
CREATE POLICY "Tags: Anyone can view"
    ON public.tags FOR SELECT
    USING (true);

CREATE POLICY "Tags: Admins can manage"
    ON public.tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Articles policies
CREATE POLICY "Articles: Anyone can view published"
    ON public.articles FOR SELECT
    USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "Articles: Authors can create"
    ON public.articles FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Articles: Authors can update own"
    ON public.articles FOR UPDATE
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

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
CREATE POLICY "Article Tags: Anyone can view"
    ON public.article_tags FOR SELECT
    USING (true);

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
CREATE POLICY "Comments: Anyone can view approved"
    ON public.comments FOR SELECT
    USING (is_approved = true OR user_id = auth.uid());

CREATE POLICY "Comments: Authenticated users can create"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comments: Users can update own"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Comments: Users can delete own"
    ON public.comments FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Bookmarks policies
CREATE POLICY "Bookmarks: Users can view own"
    ON public.bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Bookmarks: Users can manage own"
    ON public.bookmarks FOR ALL
    USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes: Anyone can view"
    ON public.likes FOR SELECT
    USING (true);

CREATE POLICY "Likes: Users can manage own"
    ON public.likes FOR ALL
    USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Notifications: Users can view own"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Notifications: Users can manage own"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

-- Site Settings policies (PUBLIC READ for dynamic content)
CREATE POLICY "Site Settings: Anyone can view"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Site Settings: Admins can manage"
    ON public.site_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Newsletter Subscribers policies
CREATE POLICY "Newsletter: Anyone can subscribe"
    ON public.newsletter_subscribers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Newsletter: Anyone can view own"
    ON public.newsletter_subscribers FOR SELECT
    USING (true);

CREATE POLICY "Newsletter: Admins can manage"
    ON public.newsletter_subscribers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================================================
-- PART 8: STORAGE BUCKETS
-- ========================================================================

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('avatars', 'avatars', true),
    ('articles', 'articles', true),
    ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
DROP POLICY IF EXISTS "Avatars: Anyone can view" ON storage.objects;
CREATE POLICY "Avatars: Anyone can view"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars: Authenticated users can upload" ON storage.objects;
CREATE POLICY "Avatars: Authenticated users can upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Avatars: Users can update own" ON storage.objects;
CREATE POLICY "Avatars: Users can update own"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Avatars: Users can delete own" ON storage.objects;
CREATE POLICY "Avatars: Users can delete own"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for articles bucket
DROP POLICY IF EXISTS "Articles: Anyone can view" ON storage.objects;
CREATE POLICY "Articles: Anyone can view"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'articles');

DROP POLICY IF EXISTS "Articles: Authenticated users can upload" ON storage.objects;
CREATE POLICY "Articles: Authenticated users can upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'articles' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Articles: Authors can update" ON storage.objects;
CREATE POLICY "Articles: Authors can update"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'articles' AND
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Articles: Authors can delete" ON storage.objects;
CREATE POLICY "Articles: Authors can delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'articles' AND
        auth.role() = 'authenticated'
    );

-- Storage policies for site-assets bucket
DROP POLICY IF EXISTS "Site Assets: Anyone can view" ON storage.objects;
CREATE POLICY "Site Assets: Anyone can view"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Site Assets: Admins can manage" ON storage.objects;
CREATE POLICY "Site Assets: Admins can manage"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'site-assets' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================================================
-- PART 9: INITIAL SEED DATA
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

-- Insert default site settings (only if no settings exist)
INSERT INTO public.site_settings (
    site_name,
    site_logo,
    tagline,
    description,
    seo_title,
    seo_description,
    seo_keywords,
    newsletter_enabled,
    comments_enabled,
    rss_enabled,
    copyright_notice,
    company_name,
    contact_email,
    about_title,
    about_subtitle
)
SELECT
    'NewsHub',
    NULL,
    'Your source for the latest news',
    'Stay informed with the latest news and stories from around the world',
    'NewsHub - Latest News & Stories',
    'Get the latest breaking news, analysis, and stories from around the world',
    ARRAY['news', 'breaking news', 'latest news', 'world news', 'current events'],
    true,
    true,
    true,
    '© 2025 NewsHub. All rights reserved.',
    'NewsHub',
    'contact@newshub.com',
    'About Us',
    'Learn more about our mission and values'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings LIMIT 1);

-- ========================================================================
-- PART 10: VERIFICATION & SUCCESS MESSAGE
-- ========================================================================

DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    bucket_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Count storage buckets
    SELECT COUNT(*) INTO bucket_count
    FROM storage.buckets;
    
    -- Success message
    RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ SCHEMA SETUP COMPLETED SUCCESSFULLY!                  ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Database Statistics:';
    RAISE NOTICE '  • Tables created: % (public schema)', table_count;
    RAISE NOTICE '  • RLS policies: % policies', policy_count;
    RAISE NOTICE '  • Storage buckets: % buckets', bucket_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '  1. Update your .env file with Supabase credentials';
    RAISE NOTICE '  2. Create your first admin user account';
    RAISE NOTICE '  3. Log in to /admin to configure site settings';
    RAISE NOTICE '  4. Start creating articles!';
    RAISE NOTICE '';
    RAISE NOTICE '📚 Key Features Enabled:';
    RAISE NOTICE '  • Dynamic content management (80+ settings fields)';
    RAISE NOTICE '  • Public access (visitors can read without login)';
    RAISE NOTICE '  • User authentication & profiles';
    RAISE NOTICE '  • Article management (create, edit, publish)';
    RAISE NOTICE '  • Comments & reactions';
    RAISE NOTICE '  • Categories & tags';
    RAISE NOTICE '  • Newsletter subscriptions';
    RAISE NOTICE '  • Image storage (avatars, articles, site assets)';
    RAISE NOTICE '  • RSS feed support';
    RAISE NOTICE '';
    RAISE NOTICE '⚙️  To verify your setup, run these queries:';
    RAISE NOTICE '  SELECT table_name FROM information_schema.tables WHERE table_schema = ''public'';';
    RAISE NOTICE '  SELECT * FROM public.site_settings;';
    RAISE NOTICE '';
END $$;

-- ========================================================================
-- END OF SCHEMA
-- ========================================================================

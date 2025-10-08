import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please create a .env file with:');
  console.error('VITE_SUPABASE_URL=your_supabase_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Storage bucket names
export const AVATARS_BUCKET = 'avatars';
export const ARTICLES_BUCKET = 'article-images';

// File size limits (in bytes)
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_ARTICLE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Helper functions
export const uploadAvatar = async (userId, file) => {
  if (!file) throw new Error('No file provided');
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error(`Avatar must be less than ${MAX_AVATAR_SIZE / 1024 / 1024}MB`);
  }

  try {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    console.log('Uploading avatar:', fileName);

    // Upload file to storage
    const { data, error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(fileName, file, { 
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(AVATARS_BUCKET)
      .getPublicUrl(fileName);

    console.log('Public URL:', urlData.publicUrl);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    throw error;
  }
};

export const uploadArticleImage = async (articleId, file) => {
  if (!file) throw new Error('No file provided');
  if (file.size > MAX_ARTICLE_IMAGE_SIZE) {
    throw new Error(`Image must be less than ${MAX_ARTICLE_IMAGE_SIZE / 1024 / 1024}MB`);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${articleId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(ARTICLES_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(ARTICLES_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteFile = async (bucket, filePath) => {
  const fileName = filePath.split('/').pop();
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);
  
  if (error) throw error;
};

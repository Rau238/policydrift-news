import { supabase } from '../lib/supabase';

/**
 * Generates XML sitemap with all published articles and static pages
 * @returns {Promise<string>} XML sitemap content
 */
export async function generateSitemap() {
  const baseUrl = 'https://www.policydrift.live';
  const currentDate = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0', lastmod: currentDate },
    { url: '/about', changefreq: 'monthly', priority: '0.8', lastmod: currentDate },
    { url: '/contact', changefreq: 'monthly', priority: '0.7', lastmod: currentDate },
    { url: '/privacy-policy', changefreq: 'yearly', priority: '0.5', lastmod: currentDate },
    { url: '/terms-of-service', changefreq: 'yearly', priority: '0.5', lastmod: currentDate },
    { url: '/accessibility', changefreq: 'yearly', priority: '0.5', lastmod: currentDate },
  ];

  // Fetch all published articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, updated_at, created_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles for sitemap:', error);
  }

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug')
    .order('name');

  // Fetch all tags
  const { data: tags } = await supabase
    .from('tags')
    .select('id, slug')
    .order('name');

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add article pages
  if (articles && articles.length > 0) {
    articles.forEach(article => {
      const lastmod = article.updated_at || article.created_at;
      const formattedDate = new Date(lastmod).toISOString().split('T')[0];
      const publishDate = new Date(article.created_at);
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/article/${article.slug}</loc>\n`;
      xml += `    <lastmod>${formattedDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      
      // Add Google News specific tags for recent articles (within 2 days)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      if (publishDate > twoDaysAgo) {
        xml += `    <news:news>\n`;
        xml += `      <news:publication>\n`;
        xml += `        <news:name>PolicyDrift News</news:name>\n`;
        xml += `        <news:language>en</news:language>\n`;
        xml += `      </news:publication>\n`;
        xml += `      <news:publication_date>${publishDate.toISOString()}</news:publication_date>\n`;
        xml += `    </news:news>\n`;
      }
      
      xml += '  </url>\n';
    });
  }

  // Add category pages
  if (categories && categories.length > 0) {
    categories.forEach(category => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/category/${category.slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n';
    });
  }

  // Add tag pages
  if (tags && tags.length > 0) {
    tags.forEach(tag => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/tag/${tag.slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    });
  }

  xml += '</urlset>';

  return xml;
}

/**
 * Downloads the sitemap as an XML file
 */
export async function downloadSitemap() {
  const xml = await generateSitemap();
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

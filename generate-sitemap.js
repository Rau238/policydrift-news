// This script generates a static sitemap.xml file
// For now, we'll create a basic sitemap. The dynamic one works in the app.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate basic sitemap.xml at build time
 * The full dynamic sitemap is available via the /sitemap page in the app
 */
function generateBasicSitemap() {
  const baseUrl = 'https://www.policydrift.live';
  const currentDate = new Date().toISOString().split('T')[0];

  const pages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/about', changefreq: 'monthly', priority: '0.8' },
    { url: '/contact', changefreq: 'monthly', priority: '0.7' },
    { url: '/privacy-policy', changefreq: 'yearly', priority: '0.5' },
    { url: '/terms-of-service', changefreq: 'yearly', priority: '0.5' },
    { url: '/accessibility', changefreq: 'yearly', priority: '0.5' },
    { url: '/sitemap', changefreq: 'weekly', priority: '0.6' },
    { url: '/rss', changefreq: 'daily', priority: '0.7' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

async function main() {
  try {
    console.log('Generating static sitemap.xml...');
    const sitemapXML = generateBasicSitemap();
    
    const publicDir = path.join(__dirname, 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');
    console.log('✅ Sitemap generated successfully at:', sitemapPath);
    console.log('📝 Size:', (sitemapXML.length / 1024).toFixed(2), 'KB');
    console.log('ℹ️  Dynamic sitemap with all articles available at /sitemap page');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

main();

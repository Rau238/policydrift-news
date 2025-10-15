import { generateSitemap } from './src/lib/sitemap.js';
import fs from 'fs';
import path from 'path';

/**
 * Generate sitemap.xml at build time
 * Run this script with: node generate-sitemap.js
 */
async function main() {
  try {
    console.log('Generating sitemap.xml...');
    const sitemapXML = await generateSitemap();
    
    const publicDir = path.join(process.cwd(), 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');
    console.log('✅ Sitemap generated successfully at:', sitemapPath);
    console.log('📝 Total size:', (sitemapXML.length / 1024).toFixed(2), 'KB');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

main();

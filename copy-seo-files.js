import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy robots.txt
const robotsContent = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /signup
Disallow: /profile
Disallow: /api/
Disallow: /*.json$

# Google AdSense
User-agent: Mediapartners-Google
Allow: /

# Sitemaps
Sitemap: https://www.policydrift.live/sitemap.xml
Sitemap: https://www.policydrift.live/rss.xml

# Crawl-delay for specific bots
User-agent: Baiduspider
Crawl-delay: 1

User-agent: Yandex
Crawl-delay: 1
`;

fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsContent, 'utf8');
console.log('✅ robots.txt copied to dist/');

// Copy sitemap.xml
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.policydrift.live/</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.policydrift.live/about</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.policydrift.live/contact</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.policydrift.live/privacy-policy</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.policydrift.live/terms-of-service</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.policydrift.live/accessibility</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.policydrift.live/sitemap</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.policydrift.live/rss</loc>
    <lastmod>2025-01-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf8');
console.log('✅ sitemap.xml copied to dist/');

// Copy rss.xml
const currentDate = new Date().toUTCString();
const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PolicyDrift News</title>
    <link>https://www.policydrift.live</link>
    <description>Stay updated with the latest news, insights, and perspectives from around the world</description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="https://www.policydrift.live/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://www.policydrift.live/logo.png</url>
      <title>PolicyDrift News</title>
      <link>https://www.policydrift.live</link>
    </image>
    <item>
      <title>Welcome to PolicyDrift News</title>
      <link>https://www.policydrift.live</link>
      <description>Your trusted source for breaking news and in-depth analysis</description>
      <pubDate>${currentDate}</pubDate>
      <guid>https://www.policydrift.live</guid>
    </item>
  </channel>
</rss>`;

fs.writeFileSync(path.join(distDir, 'rss.xml'), rssContent, 'utf8');
console.log('✅ rss.xml copied to dist/');

console.log('\n🎉 All SEO files copied to dist/');

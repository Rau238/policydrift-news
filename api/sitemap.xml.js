import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  
  try {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(sitemap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load sitemap' });
  }
}

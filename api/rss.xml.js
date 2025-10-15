import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const rssPath = path.join(process.cwd(), 'public', 'rss.xml');
  
  try {
    const rss = fs.readFileSync(rssPath, 'utf8');
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(rss);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load RSS feed' });
  }
}

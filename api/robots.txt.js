import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  
  try {
    const robots = fs.readFileSync(robotsPath, 'utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(robots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load robots.txt' });
  }
}

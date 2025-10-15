module.exports = (req, res) => {
  const robots = `# https://www.robotstxt.org/robotstxt.html
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
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(robots);
};

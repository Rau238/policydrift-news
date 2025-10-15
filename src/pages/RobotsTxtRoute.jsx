import { useEffect } from 'react';

const RobotsTxtRoute = () => {
  useEffect(() => {
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

    // Replace the entire document with text
    document.open();
    document.write(robots);
    document.close();
  }, []);

  return (
    <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
      {`# https://www.robotstxt.org/robotstxt.html
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
`}
    </pre>
  );
};

export default RobotsTxtRoute;

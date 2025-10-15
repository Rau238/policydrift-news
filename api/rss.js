module.exports = (req, res) => {
  const currentDate = new Date().toUTCString();
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
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
  
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(rss);
};

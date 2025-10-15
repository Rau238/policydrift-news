import { useEffect } from 'react';

const RSSXMLRoute = () => {
  useEffect(() => {
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

    // Replace the entire document with XML
    document.open();
    document.write(rss);
    document.close();
  }, []);

  return (
    <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
      {`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PolicyDrift News</title>
    <link>https://www.policydrift.live</link>
    <description>Stay updated with the latest news, insights, and perspectives from around the world</description>
    <language>en-us</language>
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
      <guid>https://www.policydrift.live</guid>
    </item>
  </channel>
</rss>`}
    </pre>
  );
};

export default RSSXMLRoute;

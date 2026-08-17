async function testSeo() {
  console.log('Testing SEO, OpenGraph & Social Media endpoints...\n');

  // 1. OG Image Endpoint
  const ogRes = await fetch('http://localhost:3000/api/og?title=India+Announces+Major+Policy+Reform&category=POLITICS');
  const ogBuffer = await ogRes.arrayBuffer();
  console.log('✓ /api/og dynamic image:', {
    status: ogRes.status,
    contentType: ogRes.headers.get('content-type'),
    sizeBytes: ogBuffer.byteLength,
  });

  // 2. Robots.txt
  const robRes = await fetch('http://localhost:3000/robots.txt');
  const robText = await robRes.text();
  console.log('\n✓ /robots.txt content:\n' + robText.trim());

  // 3. Sitemap index
  const sitemapRes = await fetch('http://localhost:3000/sitemap.xml');
  console.log('\n✓ /sitemap.xml index:', {
    status: sitemapRes.status,
    contentType: sitemapRes.headers.get('content-type'),
  });

  // 4. Homepage HTML & JSON-LD
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  const hasNewsOrg = homeHtml.includes('NewsMediaOrganization');
  const hasWebSite = homeHtml.includes('WebSite');
  const hasOgImage = homeHtml.includes('og:image');
  const hasTwitter = homeHtml.includes('twitter:card');

  console.log('\n✓ Homepage SEO Elements:', {
    hasNewsMediaOrganizationSchema: hasNewsOrg,
    hasWebSiteSearchActionSchema: hasWebSite,
    hasOpenGraphImage: hasOgImage,
    hasTwitterCard: hasTwitter,
  });

  // 5. Test Sample Article Page
  const articleRes = await fetch('http://localhost:3000/news/my-husband-and-i-are-at-odds-should-we-tap-our-home-equity-or-sell-stocks-to-build-a-dollar100000-emergency-fund');
  const articleHtml = await articleRes.text();
  console.log('\n✓ Article Page SEO Elements:', {
    status: articleRes.status,
    hasNewsArticleSchema: articleHtml.includes('NewsArticle'),
    hasBreadcrumbListSchema: articleHtml.includes('BreadcrumbList'),
    hasSpeakableSchema: articleHtml.includes('SpeakableSpecification'),
    hasHeadlineId: articleHtml.includes('id="article-headline"'),
    hasTakeawaysId: articleHtml.includes('id="article-takeaways"'),
    hasOpenGraphArticleSection: articleHtml.includes('article:section'),
    hasGoogleBotDirectives: articleHtml.includes('max-image-preview:large'),
  });
}

testSeo().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

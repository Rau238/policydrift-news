/** @type {import('next').NextConfig} */
const indexnowKey = process.env.INDEXNOW_KEY?.trim();

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()',
  },
];

const nextConfig = {
  // Isolate dev and prod build outputs so dev never collides with or corrupts production builds
  distDir: process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'development' ? '.next-dev' : '.next'),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/(sitemaps/.*|sitemap.xml|news-sitemap.xml|feed.xml|rss)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
          },
        ],
      },
      {
        source: '/uploads/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const rules = [];
    // IndexNow verification file
    if (indexnowKey && /^[0-9a-zA-Z_-]{8,128}$/.test(indexnowKey)) {
      rules.push({ source: `/${indexnowKey}.txt`, destination: '/api/indexnow/verify' });
    }
    return rules;
  },
  async redirects() {
    return [
      { source: '/blog', destination: '/news', permanent: true },
      { source: '/blog/:path*', destination: '/news/:path*', permanent: true },
      { source: '/news/desk/:desk', destination: '/news/:desk', permanent: true },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days image cache
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  // Reduce memory usage during static page generation (prevents OOM on build)
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // Treat ESLint warnings as non-fatal during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

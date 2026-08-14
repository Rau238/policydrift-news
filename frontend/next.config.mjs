/** @type {import('next').NextConfig} */
const indexnowKey = process.env.INDEXNOW_KEY?.trim();

const nextConfig = {
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
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;

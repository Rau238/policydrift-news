/** @type {import('next').NextConfig} */
const nextConfig = {
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

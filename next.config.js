/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/passio-prod-env-public-cdn-data/**',
      },
    ],
  },
  // Next.js 15 has a different configuration structure
  // The timeouts are handled in our API routes using AbortController
  experimental: {
    // Only keep recognized experimental features
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;

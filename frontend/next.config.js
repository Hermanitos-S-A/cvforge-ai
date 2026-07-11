/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://cvforge-backend:8000/api/:path*',
      },
    ];
  },
};
module.exports = nextConfig;

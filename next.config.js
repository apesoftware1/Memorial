/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'https://typical-car-e0b66549b3.strapiapp.com', // e.g. cdn.example.com
      },
    ],
  },
  // Simplified webpack config to fix 404 errors
  webpack: (config, { dev, isServer }) => {
    // Basic module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(process.cwd(), './'),
    }
    return config
  },
}

module.exports = nextConfig
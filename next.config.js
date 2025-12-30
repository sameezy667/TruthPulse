/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Standard build for Capacitor
  // API routes will work when deployed separately
  distDir: '.next',
};

module.exports = nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.56.1',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
    // Disable image optimization untuk development dan production
    // Karena menggunakan local file storage
    unoptimized: true,
    // Format yang didukung
    formats: ['image/webp'],
    // Device sizes untuk responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Image sizes untuk different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable static image import optimization
    disableStaticImages: false,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // Local development (deprecated - kept for backward compatibility)
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
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.56.1',
        port: '3000',
        pathname: '/api/uploads/**',
      },
      // Supabase Storage (production)
      {
        protocol: 'https',
        hostname: 'yoayfhdrfhicepqmorxr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Alternative Supabase CDN domains (if used)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
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

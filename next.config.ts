import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          }
        ],
      },
    ];
  },
  
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

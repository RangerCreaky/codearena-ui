import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/signup',
        destination: '/login',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/rooms',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/rooms/`,
      },
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;

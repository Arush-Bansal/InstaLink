import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'linktr.ee',
      },
      {
        protocol: 'https',
        hostname: 'ugc.production.linktr.ee',
      },
      {
        protocol: 'https',
        hostname: '*.linktr.ee',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  allowedDevOrigins: ["192.168.56.1:3000"],

  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.56.1:3000"],
    },
  },
};

export default nextConfig;
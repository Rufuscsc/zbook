import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Try moving it to the top level if experimental shows it as invalid
  allowedDevOrigins: ["192.168.56.1:3000"], 
  experimental: {
    // If you are using Server Actions, they have their own allowedOrigins
    serverActions: {
      allowedOrigins: ["192.168.56.1:3000"],
    },
  }
}

export default nextConfig;

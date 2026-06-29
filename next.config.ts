import type { NextConfig } from "next";

const appHost = process.env.APP_HOST || "localhost";
const allowedOrigins = [appHost, `${appHost}:3000`, `${appHost}:3001`];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
  // Allow hot-reloading from external network interfaces
  // allowedDevOrigins: allowedOrigins,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

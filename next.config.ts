import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server mode (no static export) — required for Firebase Admin, Route Handlers,
  // and Firestore-backed catalog. Use `npm run images:optimize` for local assets.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.firebasestorage.app",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

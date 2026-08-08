import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Static export mode for CSR/static hosts. Use `npm run images:optimize` for local assets.
  // Signed/expiring image URLs require a dynamic server or external CDN; see `src/lib/image-protection.ts`.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;

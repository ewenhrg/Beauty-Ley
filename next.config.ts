import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  poweredByHeader: false,
  experimental: {
    // Two root layouts (public site per language + admin) → one 404 for unmatched URLs.
    globalNotFound: true,
    serverActions: {
      // Flyer photo uploads (raw + multipart overhead), then compressed with sharp.
      bodySizeLimit: "9mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        // Photos in /public rarely change: let browsers and the CDN keep them.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;

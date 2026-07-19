import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  turbopack: {},

  images: {
    // Serve AVIF first, fall back to WebP, then original
    formats: ["image/avif", "image/webp"],

    // Break points that match our food image sizes (100, 112, 400 px)
    deviceSizes: [375, 640, 768, 1024, 1280, 1920],
    imageSizes: [64, 100, 128, 256, 400],

    // Allow external image hosts used in the storefront
    remotePatterns: [
      // Unsplash CDN — fallback food images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Local API server uploads (dev)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      // Production API (wildcard for flexibility — lock this down per env)
      {
        protocol: "https",
        hostname: "**.kwickly.in",
        pathname: "/**",
      },
      // Any HTTPS CDN the tenant might configure for logos / item images
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],

    // Emit a warning, not an error, for unoptimised external images
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Cache optimised images for 7 days
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

export default withPWA(nextConfig);


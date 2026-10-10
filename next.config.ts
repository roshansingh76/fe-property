import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      // Unsplash (demo / placeholder images)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      // Backend uploads served from localhost in development
      { protocol: "http",  hostname: "localhost", port: "4000", pathname: "/uploads/**" },
    ],
    // Allow images from any domain — needed because the backend URL can vary
    // between environments. The remotePatterns above still restrict unknown
    // production hostnames; this setting only relaxes the optimizer's strict
    // URL-parameter whitelist check for explicitly listed patterns.
    dangerouslyAllowSVG: false,
    // Use unoptimized for backend-hosted images so Next.js passes them
    // through without re-encoding (backend already serves optimised files).
    // Production: replace with a CDN and remove this flag.
    unoptimized: true,
  },
  output: "standalone",
  experimental: {
    // optimizeCss is not needed for Tailwind v4
  },

  // Proxy /api/backend/* → backend so images can be loaded same-origin in
  // production and avoid CORS / mixed-content issues.
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ?? "https://be-property.onrender.com"}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  // Optional separate build folder, so an isolated test instance (its own database and
  // uploads) can be built and run beside the main one without touching .next.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  // Renamed pages. The browser keeps any #fragment, so /business#after-sales and
  // /manufacturing#products still land on the same section of the new page.
  async redirects() {
    return [
      { source: "/business", destination: "/services", permanent: true },
      { source: "/manufacturing", destination: "/assembly", permanent: true },
    ];
  },
  images: {
    // 100 is for the homepage campaign banners, which are served at full quality;
    // 90 suits the limited-resolution assembly photograph and the homepage's
    // "Company at a glance" group photos, so faces keep their detail.
    qualities: [75, 90, 100],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

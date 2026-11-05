import type { NextConfig } from "next";

const isExport = process.env.BUILD_MODE === 'export';

const nextConfig: NextConfig = {
  ...(isExport
    ? {
        output: 'export',
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
        async rewrites() {
          return [
            {
              source: '/sharedhost-mobile/:path*',
              destination: 'http://127.0.0.1:8080/:path*',
            },
          ];
        },
      }),
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "node:path";
/**
 * NEXT_BUILD_MODE=desktop  →  static export for Electron (FloDesktop)
 * NEXT_BUILD_MODE unset    →  standard Next.js server mode (FloPOS cloud)
 */
const isDesktop = process.env.NEXT_BUILD_MODE === "desktop";

const nextConfig: NextConfig = {
  // Static export: required for Electron — served via embedded Express,
  // not file:// so no CORS/routing issues.
  output: isDesktop ? "export" : undefined,

  // Trailing slashes make static paths predictable: /pos → /pos/index.html
  trailingSlash: isDesktop,

  // next/image optimisation requires a running server; disable for static export.
  images: {
    unoptimized: isDesktop,
  },

  // In non-desktop mode (e.g. `next dev` browser testing), proxy API calls to Express backend
  ...(!isDesktop
    ? {
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: `http://127.0.0.1:${process.env.API_PORT || '3001'}/api/:path*`,
            },
          ];
        },
      }
    : {}),

  // Silence the "multiple lockfiles / inferred workspace root" warning.
  // Allow imports from /main (countries derivation shared with backend) via alias;
  // root must encompass both frontend/ and main/, so it points at the repo root.
  turbopack: {
    root: path.resolve(process.cwd(), '..'),
    resolveAlias: {
      '@countries': '../main/countries.ts',
    },
  },
};

export default nextConfig;

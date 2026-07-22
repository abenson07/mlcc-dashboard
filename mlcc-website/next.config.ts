import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    return [
      // Shop: only the 2026 shirt preorder is live; keep cart/success/cancelled.
      {
        source: "/shop",
        destination: "/shop/2026-summer-social-shirt",
        permanent: false,
      },
      {
        source: "/shop/:slug((?!cart|success|cancelled|2026-summer-social-shirt$).*)",
        destination: "/shop/2026-summer-social-shirt",
        permanent: false,
      },
      {
        source: "/skeleton-home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/skeleton-events",
        destination: "/events",
        permanent: true,
      },
      {
        source: "/skeleton-events/template",
        destination: "/events/template",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "byqsupply-components.netlify.app",
        pathname: "/sparkles/images/**",
      },
    ],
  },
};

export default nextConfig;

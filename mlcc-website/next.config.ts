import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    return [
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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

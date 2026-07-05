import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Optional BASE_PATH for legacy Webflow Cloud mounts; leave unset on Vercel (marketing at /, admin at /admin).
const basePath = process.env.BASE_PATH || undefined;

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
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
  experimental: {
    serverActions: {
      // Allow public domains and Webflow/Cosmic internal host so origin vs x-forwarded-host check passes when behind their proxy.
      allowedOrigins: [
        "https://www.mapleleafcommunity.org",
        "www.mapleleafcommunity.org",
        "https://mapleleafcommunity.org",
        "mapleleafcommunity.org",
        "https://mapleleafcommunity.webflow.io",
        "mapleleafcommunity.webflow.io",
        "https://*.wf-app-prod.cosmic.webflow.services",
        "*.wf-app-prod.cosmic.webflow.services",
        ...(process.env.SERVER_ACTIONS_ALLOWED_ORIGIN
          ? [process.env.SERVER_ACTIONS_ALLOWED_ORIGIN]
          : []),
      ],
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

    turbopack: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },

};

export default nextConfig;
// Only run OpenNext Cloudflare dev init when in dev (avoid breaking Webflow Cloud / plain next build)
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// When deployed under a mount path (e.g. Webflow Cloud at /dashboard), set BASE_PATH and
// NEXT_PUBLIC_BASE_PATH to that path so API routes and assets are served correctly.
const basePath = process.env.BASE_PATH || undefined;

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
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

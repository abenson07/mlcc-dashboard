import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  basePath: "/dashboard",
  experimental: {
    serverActions: {
      allowedOrigins: [
        "mapleleafcommunity.webflow.io",
        "www.mapleleafcommunity.org",
        "*.wf-app-prod.cosmic.webflow.services",
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

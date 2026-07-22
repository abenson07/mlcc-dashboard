import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Optional BASE_PATH for legacy Webflow Cloud mounts; leave unset on Vercel (marketing at /, admin at /admin).
const basePath = process.env.BASE_PATH || undefined;

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
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
      // Legacy mapleleafcommunity.org (Webflow) URLs — see docs/legacy-site-redirects.md
      {
        source: "/volunteer-opportunities",
        destination: "/volunteer",
        permanent: true,
      },
      {
        source: "/the-leaflet",
        destination: "/leaflet",
        permanent: true,
      },
      {
        source: "/advocacy/zoning-workshop",
        destination: "/one-seattle-plan",
        permanent: true,
      },
      {
        source: "/committee/newsletter",
        destination: "/committees/newsletter",
        permanent: true,
      },
      {
        source: "/committee/communications",
        destination: "/committees/communications",
        permanent: true,
      },
      {
        source: "/committee/emergency-hub",
        destination: "/committees/emergency-hub",
        permanent: true,
      },
      {
        source: "/committee/advocacy",
        destination: "/committees/advocacy",
        permanent: true,
      },
      {
        source: "/committee/business-committee",
        destination: "/committees/business-committee",
        permanent: true,
      },
      {
        source: "/committee/outreach",
        destination: "/committees/communications",
        permanent: true,
      },
      {
        source: "/committee/summer-social",
        destination: "/committees/events",
        permanent: true,
      },
      {
        source: "/committee/movies-by-the-tower",
        destination: "/committees/events",
        permanent: true,
      },
      {
        source: "/committee/silent-book-club",
        destination: "/committees/events",
        permanent: true,
      },
      {
        source: "/event/2026-maple-leaf-volunteer-committee-open-house",
        destination: "/leaflet/template/2026-volunteer-open-house",
        permanent: true,
      },
      {
        source: "/events/spring-community-meeting",
        destination: "/events",
        permanent: true,
      },
      {
        source: "/stories/a-fresh-start-for-maple-leaf-join-our-2026-volunteer-committee-open-house",
        destination: "/leaflet/template/2026-volunteer-open-house",
        permanent: true,
      },
      {
        // Points to /one-seattle-plan (not the leaflet story) because the
        // advocacy-and-zoning-workshops story is still draft: true and 404s.
        // Revisit once data/leaflet-stories.ts publishes that story.
        source: "/stories/a-place-to-work-through-hard-questions-together",
        destination: "/one-seattle-plan",
        permanent: true,
      },
      {
        source: "/stories/a-quiet-way-to-belong",
        destination: "/leaflet/template/silent-book-club",
        permanent: true,
      },
      {
        source: "/stories/bringing-neighbors-together-to-learn-ask-questions-and-be-heard",
        destination: "/leaflet/template/community-meetings",
        permanent: true,
      },
      {
        source: "/stories/building-connections-under-the-stars",
        destination: "/leaflet/template/movies-by-the-tower",
        permanent: true,
      },
      {
        source: "/stories/built-by-neighbors-sustained-by-neighbors",
        destination: "/leaflet/template/built-by-neighbors",
        permanent: true,
      },
      {
        source: "/stories/carrying-the-halloween-parade-forward",
        destination: "/leaflet/template/halloween-parade",
        permanent: true,
      },
      {
        source: "/stories/connecting-maple-leaf-through-the-decades",
        destination: "/leaflet/template/the-leaflet",
        permanent: true,
      },
      {
        source: "/stories/conversations-close-to-home",
        destination: "/leaflet/template/love-your-neighbor",
        permanent: true,
      },
      {
        source: "/stories/housing-types",
        destination: "/leaflet/template/housing-types",
        permanent: true,
      },
      {
        source: "/stories/one-seattle-plan-speak-up-for-maple-leafs-future",
        destination: "/leaflet/template/one-seattle-plan",
        permanent: true,
      },
      {
        source: "/stories/summer-social-tradition-what-it-takes",
        destination: "/leaflet/template/summer-social",
        permanent: true,
      },
      {
        source: "/stories/survey",
        destination: "/leaflet/template/visioning-survey",
        permanent: true,
      },
      // Routes not yet ready for main; keep them live on staging only.
      {
        source: "/about/maple-leaf",
        destination: "/",
        permanent: false,
      },
      {
        source: "/board",
        destination: "/",
        permanent: false,
      },
      {
        source: "/committees/template",
        destination: "/",
        permanent: false,
      },
      {
        source: "/events/template",
        destination: "/",
        permanent: false,
      },
      {
        source: "/join-the-board",
        destination: "/",
        permanent: false,
      },
      {
        source: "/join-the-board/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/leaflet/issues",
        destination: "/",
        permanent: false,
      },
      {
        source: "/leaflet/template",
        destination: "/",
        permanent: false,
      },
      {
        source: "/leaflet/issue/template",
        destination: "/",
        permanent: false,
      },
      {
        source: "/meeting-minutes",
        destination: "/",
        permanent: false,
      },
      {
        source: "/meeting-minutes/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/membership/business",
        destination: "/",
        permanent: false,
      },
      {
        source: "/submit-event",
        destination: "/",
        permanent: false,
      },
      {
        source: "/submit-event/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/submit-story",
        destination: "/",
        permanent: false,
      },
      {
        source: "/submit-story/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/volunteer/template",
        destination: "/",
        permanent: false,
      },
      {
        source: "/admin/leaflet/substitutions",
        destination: "/admin/leaflet/skipped-routes",
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
    viewTransition: true,
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

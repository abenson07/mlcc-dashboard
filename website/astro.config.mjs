import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

// Rendered on request and cached at the CDN (see src/middleware.ts): a publish shows up
// within about a minute with no rebuild, and edit mode (signed token from the dashboard)
// bypasses the cache and reads draft content.
export default defineConfig({
  site: env.PUBLIC_SITE_URL ?? "http://localhost:4321",
  output: "server",
  adapter: vercel(),
  integrations: [
    react(),
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID,
      dataset: env.PUBLIC_SANITY_DATASET ?? "production",
      apiVersion: "2025-02-19",
      useCdn: false,
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});

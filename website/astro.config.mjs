import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// Static by default; routes that need draft content (Sanity Presentation) opt in
// with `export const prerender = false`. The Sanity integration is added once the
// project ID and dataset exist (see PUBLIC_SANITY_* in .env.example).
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? "http://localhost:4321",
  output: "static",
  adapter: vercel(),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});

"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "@sanity-schemas/index";

/** Studio mounted inside the admin at /admin/website. Schemas are shared with the Astro site via /sanity/schemas. */
export default defineConfig({
  name: "mlcc",
  title: "MLCC Website",
  basePath: "/admin/website",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  plugins: [structureTool(), visionTool({ defaultApiVersion: "2025-02-19" })],
  schema: { types: schemaTypes },
});

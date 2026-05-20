#!/usr/bin/env node
/**
 * Writes shared/js/config.js from MLCC_API_BASE_URL (required in CI/Vercel).
 * Optional: MLCC_LANDING_RETURN_ORIGIN for returnOrigin override.
 */
const fs = require("fs");
const path = require("path");

const apiBase = process.env.MLCC_API_BASE_URL?.trim();
if (!apiBase) {
  console.error("MLCC_API_BASE_URL is required for build");
  process.exit(1);
}

const returnOrigin =
  process.env.MLCC_LANDING_RETURN_ORIGIN?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

const outPath = path.join(__dirname, "../shared/js/config.js");
const content = `window.MLCC_CONFIG = {
  apiBase: ${JSON.stringify(apiBase.replace(/\/$/, ""))},
  returnOrigin: ${JSON.stringify(returnOrigin)},
};
`;

fs.writeFileSync(outPath, content, "utf8");
console.log("Wrote", outPath);

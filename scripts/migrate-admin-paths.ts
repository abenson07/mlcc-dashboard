#!/usr/bin/env tsx
/**
 * One-time migration: prefix dashboard internal paths with /admin in src/.
 * Skips auth routes, API routes, and paths already under /admin.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

/** Longest first so /events-hub is matched before /events */
const ADMIN_SEGMENTS = [
  "events-hub",
  "duplicate-memberships",
  "tshirt-preorders",
  "form-elements",
  "basic-tables",
  "mercury-table",
  "table-widgets",
  "line-chart",
  "bar-chart",
  "error-404",
  "neighbors",
  "volunteers",
  "businesses",
  "sponsorship",
  "communications",
  "marketing",
  "commerce",
  "fundraising",
  "profile",
  "blank",
  "alerts",
  "avatars",
  "badge",
  "buttons",
  "images",
  "videos",
  "leaflet",
  "people",
  "finance",
  "stories",
  "settings",
  "action-items",
  "features",
  "calendar",
  "modals",
  "events",
  "routes",
  "billing",
  "table",
  "biz",
  "site",
].sort((a, b) => b.length - a.length);

const SKIP_PREFIXES = ["/admin", "/login", "/signup", "/reset-password", "/api"];

function shouldPrefix(pathLiteral: string): boolean {
  if (!pathLiteral.startsWith("/")) return false;
  if (SKIP_PREFIXES.some((p) => pathLiteral === p || pathLiteral.startsWith(`${p}/`))) {
    return false;
  }
  const segment = pathLiteral.slice(1).split(/[/?#]/)[0];
  return ADMIN_SEGMENTS.includes(segment);
}

function prefixPath(pathLiteral: string): string {
  if (!shouldPrefix(pathLiteral)) return pathLiteral;
  return `/admin${pathLiteral}`;
}

function transformContent(content: string): string {
  return content.replace(
    /(["'`])(\/[^"'`\s]*)\1/g,
    (match, quote: string, pathLiteral: string) => {
      if (!shouldPrefix(pathLiteral)) return match;
      return `${quote}${prefixPath(pathLiteral)}${quote}`;
    },
  );
}

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "app" && dir.endsWith(`${path.sep}src`)) {
        for (const sub of fs.readdirSync(full, { withFileTypes: true })) {
          if (sub.name === "(marketing)") continue;
          files.push(...walk(path.join(full, sub.name)));
        }
        continue;
      }
      files.push(...walk(full));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(SRC)) {
  const original = fs.readFileSync(file, "utf8");
  const updated = transformContent(original);
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changed++;
    console.log("updated:", path.relative(ROOT, file));
  }
}

console.log(`Done. ${changed} files updated.`);

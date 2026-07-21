// One-off migration tool: enumerate every Webflow CDN URL referenced in source.
// Run with: tsx scripts/webflow-image-migration/01-enumerate.ts
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");

const SCAN_DIRS = ["mlcc-website", "src"];
const EXCLUDE_DIRS = new Set(["node_modules", ".next", ".wrangler", ".git"]);
const EXCLUDE_FILES = new Set([
  path.join(ROOT, "src/devlink/global.css"),
  path.join(ROOT, "maple-leaf-landings/shared/css/design-system.css"),
]);
const SCAN_EXTS = new Set([".ts", ".tsx", ".js", ".css"]);
const CDN_HOSTS = ["cdn.prod.website-files.com", "d3e54v103j8qbb.cloudfront.net"];
const FONT_EXTS = [".woff2", ".woff", ".ttf", ".otf"];

interface Hit {
  url: string;
  files: { file: string; line: number }[];
}

function walk(dir: string, out: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (SCAN_EXTS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
}

function extractUrls(text: string): string[] {
  const urls: string[] = [];
  for (const host of CDN_HOSTS) {
    const hostIdx = `https://${host}`;
    let searchFrom = 0;
    for (;;) {
      const idx = text.indexOf(hostIdx, searchFrom);
      if (idx === -1) break;
      const quoteChar = text[idx - 1];
      searchFrom = idx + hostIdx.length;
      if (quoteChar !== '"' && quoteChar !== "'" && quoteChar !== "`") {
        continue;
      }
      const closeIdx = text.indexOf(quoteChar, idx);
      if (closeIdx === -1) continue;
      const url = text.slice(idx, closeIdx);
      urls.push(url);
    }
  }
  return urls;
}

const files: string[] = [];
for (const dir of SCAN_DIRS) {
  walk(path.join(ROOT, dir), files);
}

const byUrl = new Map<string, Hit>();

for (const file of files) {
  if (EXCLUDE_FILES.has(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (!CDN_HOSTS.some((h) => text.includes(h))) continue;
  const lines = text.split("\n");
  const urlsInFile = extractUrls(text);
  for (const url of urlsInFile) {
    if (FONT_EXTS.some((ext) => url.toLowerCase().includes(ext))) continue;
    let hit = byUrl.get(url);
    if (!hit) {
      hit = { url, files: [] };
      byUrl.set(url, hit);
    }
    // find line numbers of this url in the file (may appear multiple times)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(url)) {
        hit.files.push({ file: path.relative(ROOT, file), line: i + 1 });
      }
    }
  }
}

const result = Array.from(byUrl.values()).sort((a, b) => a.url.localeCompare(b.url));

fs.writeFileSync(
  path.join(ROOT, "scripts/webflow-image-migration/raw-urls.json"),
  JSON.stringify(result, null, 2) + "\n"
);

console.log(`Found ${result.length} unique Webflow CDN URLs across scanned files.`);
console.log(`Written to scripts/webflow-image-migration/raw-urls.json`);

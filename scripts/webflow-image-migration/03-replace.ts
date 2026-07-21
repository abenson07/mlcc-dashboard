// One-off migration tool: replace CDN URLs with local paths across source files.
// Run with: tsx scripts/webflow-image-migration/03-replace.ts
import fs from "node:fs";
import path from "node:path";
import { manifest } from "./manifest.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const EXCLUDE_FILES = new Set([
  path.join(ROOT, "src/devlink/global.css"),
  path.join(ROOT, "maple-leaf-landings/shared/css/design-system.css"),
]);

interface RawUrlEntry {
  url: string;
  files: { file: string; line: number }[];
}

const rawUrls: RawUrlEntry[] = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/webflow-image-migration/raw-urls.json"), "utf8")
);

const downloadReport: { url: string; status: string }[] = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts/webflow-image-migration/download-report.json"), "utf8")
);
const succeededUrls = new Set(
  downloadReport.filter((r) => r.status === "ok" || r.status === "skipped").map((r) => r.url)
);

const manifestByUrl = new Map(manifest.map((m) => [m.url, m]));

const filesChanged = new Map<string, number>();
const skippedUrls: string[] = [];

for (const raw of rawUrls) {
  if (!succeededUrls.has(raw.url)) {
    skippedUrls.push(raw.url);
    continue;
  }
  const entry = manifestByUrl.get(raw.url);
  if (!entry) {
    console.warn(`No manifest entry for ${raw.url}, skipping`);
    continue;
  }
  const localPath = `/images/${entry.feature}/${entry.filename}`;

  const uniqueFiles = Array.from(new Set(raw.files.map((f) => f.file)));
  for (const relFile of uniqueFiles) {
    const absFile = path.join(ROOT, relFile);
    if (EXCLUDE_FILES.has(absFile)) continue;
    let text = fs.readFileSync(absFile, "utf8");
    if (!text.includes(raw.url)) continue;
    const count = text.split(raw.url).length - 1;
    text = text.split(raw.url).join(localPath);
    fs.writeFileSync(absFile, text);
    filesChanged.set(relFile, (filesChanged.get(relFile) ?? 0) + count);
  }
}

console.log("Files changed:");
for (const [file, count] of Array.from(filesChanged.entries()).sort()) {
  console.log(`  ${file}: ${count} replacement(s)`);
}
console.log(`\nTotal files changed: ${filesChanged.size}`);
if (skippedUrls.length) {
  console.log(`\nSkipped (no successful download) — left as-is:`);
  for (const url of skippedUrls) console.log(`  ${url}`);
}

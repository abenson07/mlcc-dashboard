// One-off migration tool: download every manifest image into both apps' public/images/.
// Run with: tsx scripts/webflow-image-migration/02-download.ts [--force]
import fs from "node:fs";
import path from "node:path";
import { manifest } from "./manifest.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const FORCE = process.argv.includes("--force");

const APP_PUBLIC: Record<"root" | "website", string> = {
  root: path.join(ROOT, "public/images"),
  website: path.join(ROOT, "mlcc-website/public/images"),
};

interface ReportEntry {
  url: string;
  status: "ok" | "skipped" | "failed";
  targets: string[];
  bytes?: number;
  contentType?: string;
  error?: string;
}

const report: ReportEntry[] = [];

async function main() {
for (const entry of manifest) {
  const targets = entry.apps.map((app) => path.join(APP_PUBLIC[app], entry.feature, entry.filename));
  const allExist = !FORCE && targets.every((t) => fs.existsSync(t));
  if (allExist) {
    report.push({ url: entry.url, status: "skipped", targets: targets.map((t) => path.relative(ROOT, t)) });
    console.log(`SKIP (exists): ${entry.filename}`);
    continue;
  }

  try {
    let bytes: Buffer;
    let contentType: string | undefined;

    if (entry.reuseFrom) {
      const src = path.join(ROOT, entry.reuseFrom);
      bytes = fs.readFileSync(src);
      contentType = "reused-local-file";
    } else {
      const res = await fetch(entry.url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      contentType = res.headers.get("content-type") ?? undefined;
      const isImageLike =
        contentType?.startsWith("image/") ||
        contentType === "application/octet-stream" ||
        contentType === undefined;
      if (!isImageLike) {
        throw new Error(`Unexpected content-type: ${contentType}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      bytes = Buffer.from(arrayBuffer);
    }

    if (bytes.length <= 100) {
      throw new Error(`Suspiciously small download (${bytes.length} bytes)`);
    }

    for (const target of targets) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes);
    }

    report.push({
      url: entry.url,
      status: "ok",
      targets: targets.map((t) => path.relative(ROOT, t)),
      bytes: bytes.length,
      contentType,
    });
    console.log(`OK: ${entry.filename} (${bytes.length} bytes) -> ${targets.length} target(s)`);
  } catch (err) {
    report.push({
      url: entry.url,
      status: "failed",
      targets: targets.map((t) => path.relative(ROOT, t)),
      error: (err as Error).message,
    });
    console.error(`FAILED: ${entry.url} — ${(err as Error).message}`);
  }
}

fs.writeFileSync(
  path.join(ROOT, "scripts/webflow-image-migration/download-report.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const failed = report.filter((r) => r.status === "failed");
console.log(`\nDone. ok=${report.filter((r) => r.status === "ok").length} skipped=${report.filter((r) => r.status === "skipped").length} failed=${failed.length}`);
if (failed.length) {
  console.log("Failed URLs:", failed.map((f) => f.url));
}
}

main();

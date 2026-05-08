import { readFileSync } from "node:fs";
import { join } from "node:path";

let cached: string | undefined;

/** Voice/tone markdown for marketing emails (committed in repo). */
export function getVoiceToneMarkdown(): string {
  if (cached) return cached;
  const path = join(process.cwd(), "src/content/marketing-voice-tone.md");
  cached = readFileSync(path, "utf8");
  return cached;
}

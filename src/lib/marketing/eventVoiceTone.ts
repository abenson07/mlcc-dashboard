import { readFileSync } from "node:fs";
import { join } from "node:path";

let cached: string | undefined;

/** Voice/tone markdown for marketing event copy (committed in repo). */
export function getEventVoiceToneMarkdown(): string {
  if (cached) return cached;
  const path = join(process.cwd(), "src/content/marketing-event-voice-tone.md");
  cached = readFileSync(path, "utf8");
  return cached;
}

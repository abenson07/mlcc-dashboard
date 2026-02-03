const LOG_PATH = require("path").join(process.cwd(), ".cursor", "debug.log");
const INGEST = "http://127.0.0.1:7247/ingest/76125a6a-3356-4cbf-a4b0-cc4deff06696";

function payload(location: string, message: string, data: Record<string, unknown>, hypothesisId: string) {
  return { location, message, data, timestamp: Date.now(), sessionId: "debug-session", hypothesisId };
}

export function log(location: string, message: string, data: Record<string, unknown>, hypothesisId: string) {
  const p = payload(location, message, data, hypothesisId);
  try {
    require("fs").appendFileSync(LOG_PATH, JSON.stringify(p) + "\n");
  } catch {}
  fetch(INGEST, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }).catch(() => {});
}

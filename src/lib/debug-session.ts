/**
 * Debug session instrumentation (session 42f575).
 * Sends to ingest and console so deployed logs (e.g. Vercel) capture evidence.
 */
const INGEST = "http://127.0.0.1:7247/ingest/76125a6a-3356-4cbf-a4b0-cc4deff06696";
const SESSION_ID = "42f575";

function payload(location: string, message: string, data: Record<string, unknown>, hypothesisId: string) {
  return {
    sessionId: SESSION_ID,
    location,
    message,
    data,
    timestamp: Date.now(),
    hypothesisId,
  };
}

export function debugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string
) {
  const p = payload(location, message, data, hypothesisId);
  try {
    fetch(INGEST, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION_ID },
      body: JSON.stringify(p),
    }).catch(() => {});
  } catch (_) {}
  console.error("[debug-42f575]", JSON.stringify(p));
}

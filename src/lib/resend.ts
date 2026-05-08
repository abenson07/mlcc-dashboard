import { Resend } from "resend";

/** Server-only — do not import from client components. */
let singleton: Resend | undefined;

/** Resend API key from `RESEND_API_KEY` (trimmed), or undefined if unset. */
export function getResendApiKey(): string | undefined {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || undefined;
}

/**
 * Verified sender address for `<from>` in Resend payloads.
 * Configure in Resend (Domains); must match what you verify there.
 */
export function getResendFromEmail(): string | undefined {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  return from || undefined;
}

/** Shared client when the API key is set; otherwise null. */
export function getResend(): Resend | null {
  const key = getResendApiKey();
  if (!key) return null;
  if (!singleton) singleton = new Resend(key);
  return singleton;
}

/** Throws if `RESEND_API_KEY` is missing — use when sending is required. */
export function requireResend(): Resend {
  const client = getResend();
  if (!client) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return client;
}

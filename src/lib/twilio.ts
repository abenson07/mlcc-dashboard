import { createHmac, timingSafeEqual } from "crypto";

/**
 * Twilio signs webhook requests with HMAC-SHA1 over the exact webhook URL plus
 * sorted POST param key+value pairs, keyed by the Account Auth Token (never the
 * API Key/Secret pair, which Twilio's signature scheme doesn't use).
 * https://www.twilio.com/docs/usage/security#validating-requests
 */
export function isValidTwilioRequest(
  authToken: string,
  signature: string,
  url: string,
  params: URLSearchParams
): boolean {
  const sortedEntries = Array.from(params.entries()).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0
  );
  const data = sortedEntries.reduce((acc, [key, value]) => acc + key + value, url);
  const expected = createHmac("sha1", authToken).update(data, "utf8").digest("base64");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

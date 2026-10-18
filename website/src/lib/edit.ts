import { createHmac, timingSafeEqual } from "node:crypto";

export type EditKind = "text" | "textarea" | "open";

/**
 * Edit tokens are minted by the dashboard (src/lib/website/editToken.ts) and verified here.
 * Format: base64url(JSON {parent, exp}) + "." + base64url(HMAC-SHA256(payload, WEBSITE_EDIT_SECRET)).
 * `parent` is the admin origin that may frame this page and receive its postMessages.
 */
export function verifyEditToken(token: string | null): { parent: string; token: string } | null {
  const secret = process.env.WEBSITE_EDIT_SECRET ?? import.meta.env.WEBSITE_EDIT_SECRET;
  if (!token || !secret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const { parent, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof parent !== "string" || typeof exp !== "number" || exp * 1000 < Date.now()) return null;
    return { parent, token };
  } catch {
    return null;
  }
}

/**
 * Spread onto an element to make it editable in edit mode; renders nothing on the public site.
 *   text / textarea → typed directly on the page, saved on blur
 *   open            → clicking opens that field in the admin's side form
 */
export function ed(edit: unknown, id: string | undefined, field: string, kind: EditKind = "open") {
  if (!edit || !id) return {};
  return { "data-edit-id": id.replace(/^drafts\./, ""), "data-edit-field": field, "data-edit-kind": kind };
}

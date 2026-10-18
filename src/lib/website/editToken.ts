import { createHmac } from "node:crypto";

/**
 * Edit token for the public site's edit mode (verified in website/src/lib/edit.ts — keep the
 * two in sync). Format: base64url(JSON {parent, exp}) + "." + base64url(HMAC-SHA256(payload)).
 * `parent` is the admin origin allowed to frame the site and receive its postMessages.
 */
export function signEditToken(opts: { parent: string; ttlSeconds?: number; secret?: string; now?: number }): string {
  const secret = opts.secret ?? process.env.WEBSITE_EDIT_SECRET;
  if (!secret) throw new Error("WEBSITE_EDIT_SECRET is not set");
  const exp = Math.floor((opts.now ?? Date.now()) / 1000) + (opts.ttlSeconds ?? 8 * 60 * 60);
  const payload = Buffer.from(JSON.stringify({ parent: opts.parent, exp })).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

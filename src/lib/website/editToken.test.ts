import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { signEditToken } from "./editToken";

describe("signEditToken", () => {
  const secret = "test-secret";
  const parse = (t: string) => JSON.parse(Buffer.from(t.split(".")[0], "base64url").toString());

  it("embeds the parent origin and an expiry, signed with the shared secret", () => {
    const now = Date.UTC(2026, 9, 18);
    const token = signEditToken({ parent: "http://localhost:3000", ttlSeconds: 60, secret, now });
    const [payload, sig] = token.split(".");
    expect(parse(token)).toEqual({ parent: "http://localhost:3000", exp: now / 1000 + 60 });
    expect(sig).toBe(createHmac("sha256", secret).update(payload).digest("base64url"));
  });

  it("refuses to sign without a secret", () => {
    const prev = process.env.WEBSITE_EDIT_SECRET;
    delete process.env.WEBSITE_EDIT_SECRET;
    expect(() => signEditToken({ parent: "http://x" })).toThrow();
    if (prev) process.env.WEBSITE_EDIT_SECRET = prev;
  });
});

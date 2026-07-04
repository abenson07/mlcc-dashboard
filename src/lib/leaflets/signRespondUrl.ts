import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TTL_DAYS = 30;

export type RespondMode = "confirm" | "complete";

type RespondPayload = {
  leafletId: string;
  personId: string;
  deliveryId: string;
  mode?: RespondMode;
  exp: number;
};

function secret(): string {
  const s = process.env.LEAFLET_RESPONSE_SIGNING_SECRET?.trim();
  if (!s) throw new Error("LEAFLET_RESPONSE_SIGNING_SECRET is not set");
  return s;
}

function signPayload(encoded: string): string {
  return createHmac("sha256", secret()).update(encoded).digest("base64url");
}

function encodePayload(payload: RespondPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function buildRespondUrl(
  origin: string,
  params: {
    leafletId: string;
    personId: string;
    deliveryId: string;
    mode?: RespondMode;
  },
): string {
  const exp = Math.floor(Date.now() / 1000) + DEFAULT_TTL_DAYS * 24 * 60 * 60;
  const payload: RespondPayload = {
    leafletId: params.leafletId,
    personId: params.personId,
    deliveryId: params.deliveryId,
    mode: params.mode ?? "confirm",
    exp,
  };
  const encoded = encodePayload(payload);
  const sig = signPayload(encoded);
  const base = origin.replace(/\/$/, "");
  const path = `${base}/api/public/leaflet/respond`;
  return `${path}?p=${encoded}&sig=${sig}`;
}

export function verifyRespondToken(
  encoded: string,
  sig: string,
): RespondPayload | null {
  try {
    const expected = signPayload(encoded);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as RespondPayload;
    if (!payload.leafletId || !payload.personId || !payload.deliveryId) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

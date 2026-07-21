"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{8}$/;

function normalizeEmail(raw: FormDataEntryValue | null | string): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  return email.length > 0 ? email : null;
}

function authNotConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return !supabaseUrl || !supabaseKey;
}

/** Absolute origin for building the magic-link redirect (no trailing slash). */
async function getRequestOrigin(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/** Best-effort link between a signed-in auth user and their people row, by email. */
async function backfillAuthUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | null | undefined
): Promise<void> {
  if (!email) return;
  const { error } = await supabase
    .from("people")
    .update({ auth_user_id: userId })
    .is("auth_user_id", null)
    .ilike("email", email);
  if (error) {
    console.error("[login] backfillAuthUserId error", {
      code: error.code,
      message: error.message,
    });
  }
}

export type SendLoginCodeState = { error?: string; ok?: true } | null;
export type VerifyLoginCodeState = { error?: string; ok?: true } | null;
export type CheckSignInEmailResult =
  | { error: string }
  | { isAdmin: boolean; isMember: boolean };
export type StartMemberSignInResult = { error?: string; ok?: true };

export async function sendLoginCode(
  _prevState: SendLoginCodeState,
  formData: FormData
): Promise<SendLoginCodeState> {
  const email = normalizeEmail(formData.get("email"));
  if (!email) {
    return { error: "Email is required" };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address" };
  }

  if (authNotConfigured()) {
    console.error("[login] Supabase not configured");
    return {
      error: "Authentication service is not configured. Please contact support.",
    };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    console.error("[login] createClient threw", e);
    return { error: "Failed to initialize authentication. Please try again." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    console.error("[login] signInWithOtp error", {
      code: error.code,
      message: error.message,
    });
    return { error: error.message };
  }

  return { ok: true };
}

export async function verifyLoginCode(
  _prevState: VerifyLoginCodeState,
  formData: FormData
): Promise<VerifyLoginCodeState> {
  const email = normalizeEmail(formData.get("email"));
  const tokenRaw = formData.get("token");
  const token = typeof tokenRaw === "string" ? tokenRaw.trim() : "";

  if (!email) {
    return { error: "Email is required" };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address" };
  }
  if (!OTP_RE.test(token)) {
    return { error: "Enter the 8-digit code from your email" };
  }

  if (authNotConfigured()) {
    console.error("[login] Supabase not configured");
    return {
      error: "Authentication service is not configured. Please contact support.",
    };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    console.error("[login] createClient threw", e);
    return { error: "Failed to initialize authentication. Please try again." };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    console.error("[login] verifyOtp error", {
      code: error.code,
      message: error.message,
    });
    return { error: error.message };
  }

  if (data.user) {
    await backfillAuthUserId(supabase, data.user.id, data.user.email);
  }

  return { ok: true };
}

/**
 * Pre-auth lookup so the sign-in modal can branch: admins get a code, known
 * members get a magic link, unrecognized emails see the same "check your
 * email" message as members (no signal either way).
 */
export async function checkSignInEmail(
  rawEmail: string
): Promise<CheckSignInEmailResult> {
  const email = normalizeEmail(rawEmail);
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address" };
  }

  if (authNotConfigured()) {
    console.error("[login] Supabase not configured");
    return {
      error: "Authentication service is not configured. Please contact support.",
    };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    console.error("[login] createClient threw", e);
    return { error: "Failed to initialize authentication. Please try again." };
  }

  const { data, error } = await supabase.rpc("check_signin_email", {
    p_email: email,
  });

  if (error) {
    console.error("[login] check_signin_email error", {
      code: error.code,
      message: error.message,
    });
    return { error: "Something went wrong. Please try again." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    isAdmin: Boolean(row?.is_admin),
    isMember: Boolean(row?.is_member),
  };
}

/**
 * Sends a magic-link sign-in email to known members only. For unrecognized
 * emails this is a no-op, but it still returns { ok: true } so the caller
 * can show an identical "check your email" message either way.
 */
export async function startMemberSignIn(
  rawEmail: string
): Promise<StartMemberSignInResult> {
  const email = normalizeEmail(rawEmail);
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address" };
  }

  if (authNotConfigured()) {
    console.error("[login] Supabase not configured");
    return {
      error: "Authentication service is not configured. Please contact support.",
    };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    console.error("[login] createClient threw", e);
    return { error: "Failed to initialize authentication. Please try again." };
  }

  const { data: lookup, error: lookupError } = await supabase.rpc(
    "check_signin_email",
    { p_email: email }
  );

  if (lookupError) {
    console.error("[login] check_signin_email error", {
      code: lookupError.code,
      message: lookupError.message,
    });
    return { error: "Something went wrong. Please try again." };
  }

  const row = Array.isArray(lookup) ? lookup[0] : lookup;
  if (!row?.is_member || row?.is_admin) {
    // Not a known member (or is an admin, who signs in via the code flow
    // instead) — send nothing, but the caller still shows the generic
    // "check your email" message.
    return { ok: true };
  }

  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) {
    console.error("[login] member signInWithOtp error", {
      code: error.code,
      message: error.message,
    });
    // Still don't reveal anything email-specific to the client.
    return { ok: true };
  }

  return { ok: true };
}

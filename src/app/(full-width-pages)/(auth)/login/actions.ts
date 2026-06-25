"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{8}$/;

function normalizeEmail(raw: FormDataEntryValue | null): string | null {
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

export type SendLoginCodeState = { error?: string; ok?: true } | null;
export type VerifyLoginCodeState = { error?: string } | null;

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

  const { error } = await supabase.auth.verifyOtp({
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

  redirect("/admin/people");
}

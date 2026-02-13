"use server";

import { log } from "@/lib/debug-log";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  // #region agent log
  log("login/actions.ts:signIn", "action entry", { hasEmail: !!formData.get("email"), hasPassword: !!formData.get("password") }, "H1");
  // #endregion
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // #region agent log
    log("login/actions.ts:signIn", "missing supabase env", { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }, "H1");
    console.error("[login action] Supabase not configured");
    // #endregion
    return { error: "Authentication service is not configured. Please contact support." };
  }

  let supabase;
  try {
    supabase = await createClient();
    // #region agent log
    log("login/actions.ts:signIn", "createClient ok", { hasClient: !!supabase }, "H1");
    // #endregion
  } catch (e) {
    // #region agent log
    log("login/actions.ts:signIn", "createClient throw", { err: String(e), name: (e as Error)?.name }, "H1");
    console.error("[login action] createClient threw", e);
    // #endregion
    return { error: "Failed to initialize authentication. Please try again." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // #region agent log
  log("login/actions.ts:signIn", "signInWithPassword result", { hasError: !!error, errorMessage: error?.message ?? null }, "H2");
  // #endregion

  if (error) {
    return { error: error.message };
  }

  // #region agent log
  log("login/actions.ts:signIn", "before redirect", { target: "/neighbors/all" }, "H3");
  // #endregion
  try {
    redirect("/neighbors/all");
  } catch (e) {
    // #region agent log
    log("login/actions.ts:signIn", "redirect throw", { err: String(e), name: (e as Error)?.name }, "H3");
    console.error("[login action] redirect() threw", e);
    // #endregion
    throw e;
  }
}

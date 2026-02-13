import SignInForm from "@/components/auth/SignInForm";
import { log } from "@/lib/debug-log";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

export default async function SignIn() {
  // #region agent log
  log("login/page.tsx:SignIn", "page render entry", {}, "H4");
  // #endregion

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // #region agent log
    log("login/page.tsx:SignIn", "missing supabase env", { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }, "H4");
    console.error("[login page] Supabase not configured - environment variables missing");
    // #endregion
    // Return login form without auth check if Supabase isn't configured
    return <SignInForm />;
  }

  let supabase;
  try {
    supabase = await createClient();
    // #region agent log
    log("login/page.tsx:SignIn", "createClient ok", {}, "H4");
    // #endregion
  } catch (e) {
    // #region agent log
    log("login/page.tsx:SignIn", "createClient throw", { err: String(e), name: (e as Error)?.name }, "H4");
    console.error("[login page] createClient threw", e);
    // #endregion
    // Return login form if client creation fails instead of crashing
    return <SignInForm />;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // #region agent log
    log("login/page.tsx:SignIn", "getUser result", { hasUser: !!user }, "H4");
    // #endregion
    if (user) {
      redirect("/neighbors/all");
    }
  } catch (e) {
    // #region agent log
    log("login/page.tsx:SignIn", "getUser throw", { err: String(e), name: (e as Error)?.name }, "H4");
    console.error("[login page] getUser threw", e);
    // #endregion
    // Continue to show login form if auth check fails
  }

  return <SignInForm />;
}

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
    throw e;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // #region agent log
  log("login/page.tsx:SignIn", "getUser result", { hasUser: !!user }, "H4");
  // #endregion
  if (user) {
    redirect("/neighbors/all");
  }
  return <SignInForm />;
}

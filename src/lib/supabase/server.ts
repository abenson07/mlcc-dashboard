import { log } from "@/lib/debug-log";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // #region agent log
  log("server.ts:createClient", "entry", {}, "H1");
  // #endregion
  let cookieStore;
  try {
    cookieStore = await cookies();
    // #region agent log
    log("server.ts:createClient", "cookies() ok", {}, "H1");
    // #endregion
  } catch (e) {
    // #region agent log
    log("server.ts:createClient", "cookies() throw", { err: String(e), name: (e as Error)?.name }, "H1");
    console.error("[supabase server] cookies() threw", e);
    // #endregion
    throw e;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // #region agent log
  log("server.ts:createClient", "env before create", { hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey }, "H1");
  // #endregion

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error("Missing Supabase environment variables");
    // #region agent log
    log("server.ts:createClient", "missing env vars", { hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey }, "H1");
    console.error("[supabase server] Missing required environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    // #endregion
    throw error;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (e) {
          // #region agent log
          log("server.ts:setAll", "setAll catch", { err: String(e) }, "H5");
          // #endregion
          // Called from Server Component - middleware will refresh sessions
        }
      },
    },
  });
}

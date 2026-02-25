import AdminLayoutClient from "./AdminLayoutClient";
import { debugLog } from "@/lib/debug-session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // #region agent log
  debugLog("admin/layout.tsx", "entry", {}, "H-C");
  // #endregion
  let supabase;
  try {
    supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // #region agent log
    debugLog("admin/layout.tsx", "getUser done", { hasUser: !!user }, "H-C");
    // #endregion
    if (!user) {
      // #region agent log
      debugLog("admin/layout.tsx", "redirect to login", {}, "H-C");
      // #endregion
      redirect("/login");
    }
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
  } catch (e) {
    // #region agent log
    debugLog("admin/layout.tsx", "layout throw", { err: String(e), name: (e as Error)?.name, digest: (e as { digest?: string })?.digest }, "H-C");
    // #endregion
    throw e;
  }
}

import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/** Same rule as the /admin layout: any signed-in (invited) user. */
export async function requireAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/** Who changed what on the website. Best effort: a logging failure never blocks an edit. */
export async function logWebsiteEdit(entry: {
  user: User;
  docId: string;
  docType?: string;
  action: "save" | "publish" | "discard" | "upload";
  fields?: string[];
}) {
  try {
    const db = createAdminSupabaseClient();
    if (!db) return;
    const { error } = await db.from("website_edit_log").insert({
      user_id: entry.user.id,
      user_email: entry.user.email ?? null,
      doc_id: entry.docId,
      doc_type: entry.docType ?? null,
      action: entry.action,
      fields: entry.fields ?? null,
    });
    if (error) console.warn("[website] edit log insert failed:", error.message);
  } catch (e) {
    console.warn("[website] edit log failed:", e);
  }
}

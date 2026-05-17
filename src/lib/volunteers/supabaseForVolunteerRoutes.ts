import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/** Prefer service role when set; otherwise use the signed-in user's session. */
export async function getSupabaseForVolunteerRoutes(): Promise<SupabaseClient> {
  const admin = createAdminSupabaseClient();
  if (admin) return admin;
  return createClient();
}

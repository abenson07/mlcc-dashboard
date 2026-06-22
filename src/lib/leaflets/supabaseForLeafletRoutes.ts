import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Authenticated server client, or service role when available for writes. */
export async function getSupabaseForLeafletRoutes(): Promise<SupabaseClient> {
  const admin = createAdminSupabaseClient();
  if (admin) return admin;
  return createClient();
}

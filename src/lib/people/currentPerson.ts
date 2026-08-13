import { supabaseClient } from "@/lib/supabaseClient";
import { findPersonByEmail } from "@/lib/people/findPersonByEmail";

/**
 * Resolves the logged-in dashboard user to a `people` row by matching email
 * (case-insensitive). There's no auth_user_id column on `people`, so email
 * is the only join key.
 */
export async function getCurrentPersonId(): Promise<string | null> {
  if (!supabaseClient) return null;
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user?.email) return null;

  const { person } = await findPersonByEmail(supabaseClient, user.email);
  return person?.id ?? null;
}

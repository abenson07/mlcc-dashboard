import type { SupabaseClient } from "@supabase/supabase-js";
import { looksLikeEmail } from "@/lib/committees/looksLikeEmail";

export { looksLikeEmail };

/**
 * Find or create a people row from a website signup name + contact (email or phone).
 */
export async function findOrCreatePersonFromContact(
  supabase: SupabaseClient,
  params: { name: string; contact: string },
): Promise<{ personId: string } | { error: string }> {
  const name = params.name.trim();
  const contact = params.contact.trim();
  if (!name || !contact) return { error: "Name and contact are required" };

  const isEmail = looksLikeEmail(contact);

  if (isEmail) {
    const email = contact.toLowerCase();
    const { data: existing } = await supabase
      .from("people")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (existing?.id) return { personId: existing.id as string };

    const { data: created, error } = await supabase
      .from("people")
      .insert({ full_name: name, email })
      .select("id")
      .single();
    if (error || !created) return { error: error?.message ?? "Failed to create person" };
    return { personId: created.id as string };
  }

  const { data: byPhone } = await supabase
    .from("people")
    .select("id")
    .eq("phone", contact)
    .maybeSingle();
  if (byPhone?.id) return { personId: byPhone.id as string };

  const { data: created, error } = await supabase
    .from("people")
    .insert({ full_name: name, phone: contact })
    .select("id")
    .single();
  if (error || !created) return { error: error?.message ?? "Failed to create person" };
  return { personId: created.id as string };
}

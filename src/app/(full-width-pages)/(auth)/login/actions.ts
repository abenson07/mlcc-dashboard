"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[login action] Supabase not configured");
    return { error: "Authentication service is not configured. Please contact support." };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    console.error("[login action] createClient threw", e);
    return { error: "Failed to initialize authentication. Please try again." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const cause = error.cause != null ? String(error.cause) : undefined;
    console.error("[login action] signInWithPassword error", {
      code: error.code,
      message: error.message,
      cause,
    });
    return { error: error.message };
  }

  try {
    redirect("/neighbors");
  } catch (e) {
    console.error("[login action] redirect() threw", e);
    throw e;
  }
}

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.redirect(`${origin}/login?error=sign_in_failed`);
  }

  if (data.user?.email) {
    const { error: backfillError } = await supabase
      .from("people")
      .update({ auth_user_id: data.user.id })
      .is("auth_user_id", null)
      .ilike("email", data.user.email);
    if (backfillError) {
      console.error("[auth/callback] backfill auth_user_id error", {
        code: backfillError.code,
        message: backfillError.message,
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}

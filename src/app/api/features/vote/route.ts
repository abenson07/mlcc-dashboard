import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_SURFACES = ["dashboard", "website"] as const;

export async function POST(request: NextRequest) {
  try {
    let body: { feature_id?: string; surface?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const feature_id =
      typeof body.feature_id === "string" ? body.feature_id.trim() : null;
    const surface =
      typeof body.surface === "string" && ALLOWED_SURFACES.includes(body.surface as "dashboard" | "website")
        ? (body.surface as "dashboard" | "website")
        : null;

    if (!feature_id || !surface) {
      return NextResponse.json(
        { error: "feature_id and surface (dashboard | website) are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: existing, error: selectError } = await supabase
      .from("feature_ids")
      .select("id, vote_count")
      .eq("feature_id", feature_id)
      .eq("surface", surface)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json(
        { error: selectError.message },
        { status: 502 }
      );
    }

    let newCount: number;

    if (existing) {
      const nextCount = (existing.vote_count ?? 0) + 1;
      const { data: updated, error: updateError } = await supabase
        .from("feature_ids")
        .update({ vote_count: nextCount })
        .eq("id", existing.id)
        .select("vote_count")
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 502 }
        );
      }
      newCount = updated?.vote_count ?? nextCount;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("feature_ids")
        .insert({ feature_id, surface, vote_count: 1 })
        .select("vote_count")
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 502 }
        );
      }
      newCount = inserted?.vote_count ?? 1;
    }

    return NextResponse.json({ vote_count: newCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

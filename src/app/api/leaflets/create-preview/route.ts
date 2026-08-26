import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { getSupabaseForLeafletRoutes } from "@/lib/leaflets/supabaseForLeafletRoutes";
import {
  defaultSponsorshipTierSeeds,
  extractTierSeedsFromSponsorships,
  type SponsorshipTierSeed,
} from "@/lib/sponsorship/tierPlaceholders";
import type { Sponsorships } from "@/types/database";

export async function GET() {
  const session = await requireSession();
  if (!session.ok) return session.response;

  const supabase = await getSupabaseForLeafletRoutes();
  const { data: leaflets, error: leafletsError } = await supabase
    .from("leaflets")
    .select("id, title, status, distribution_date")
    .order("distribution_date", { ascending: false });

  if (leafletsError) {
    return NextResponse.json({ error: leafletsError.message }, { status: 500 });
  }

  const titles = (leaflets ?? []).map((row) => row.title);
  const prevClosed = (leaflets ?? []).find((row) => row.status === "closed");

  let tiers: SponsorshipTierSeed[] = defaultSponsorshipTierSeeds();
  if (prevClosed?.id) {
    const { data: sponsorships, error: sponsorshipsError } = await supabase
      .from("sponsorships")
      .select("*")
      .eq("leaflet_id", prevClosed.id);
    if (sponsorshipsError) {
      return NextResponse.json({ error: sponsorshipsError.message }, { status: 500 });
    }
    const fromPrev = extractTierSeedsFromSponsorships((sponsorships ?? []) as Sponsorships[]);
    if (fromPrev.length) tiers = fromPrev;
  }

  return NextResponse.json({ titles, tiers });
}

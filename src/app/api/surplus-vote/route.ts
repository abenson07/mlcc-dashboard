import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/require-session";
import { SURPLUS_VOTE_ITEMS } from "@/lib/surplus-vote/items";
import { isCompleteRanking, scoreBallots } from "@/lib/surplus-vote/score";
import type {
  SurplusVoteGetResponse,
  SurplusVotePutResponse,
} from "@/lib/surplus-vote/types";
import { createClient } from "@/lib/supabase/server";

function payloadFromBallots(
  myRanking: string[] | null,
  allRankings: string[][],
): SurplusVoteGetResponse {
  return {
    myRanking,
    ballotCount: allRankings.length,
    results: scoreBallots(allRankings, SURPLUS_VOTE_ITEMS),
  };
}

async function loadVoteState(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("surplus_vote_ballots")
    .select("user_id, ranked_item_ids");

  if (error) {
    return { error: error.message };
  }

  const rows = data ?? [];
  const allRankings = rows
    .map((row) => row.ranked_item_ids)
    .filter((ids): ids is string[] => isCompleteRanking(ids));
  const mine = rows.find((row) => row.user_id === userId);
  const myRanking =
    mine && isCompleteRanking(mine.ranked_item_ids) ? mine.ranked_item_ids : null;

  return { payload: payloadFromBallots(myRanking, allRankings) };
}

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const loaded = await loadVoteState(auth.user.id);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: 500 });
  }
  return NextResponse.json(loaded.payload);
}

export async function PUT(request: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rankedItemIds = (body as { rankedItemIds?: unknown }).rankedItemIds;
  if (!isCompleteRanking(rankedItemIds)) {
    return NextResponse.json(
      { error: "rankedItemIds must be a complete ranking of all items" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("surplus_vote_ballots").upsert(
    {
      user_id: auth.user.id,
      ranked_item_ids: rankedItemIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const loaded = await loadVoteState(auth.user.id);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: 500 });
  }

  const response: SurplusVotePutResponse = { ...loaded.payload, saved: true };
  return NextResponse.json(response);
}

export async function DELETE() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const supabase = await createClient();
  const { error } = await supabase
    .from("surplus_vote_ballots")
    .delete()
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const loaded = await loadVoteState(auth.user.id);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: 500 });
  }

  return NextResponse.json(loaded.payload);
}

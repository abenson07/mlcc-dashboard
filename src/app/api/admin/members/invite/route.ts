import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { findPersonByEmail } from "@/lib/people/findPersonByEmail";
import { postToSlack } from "@/lib/slack";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import { slackCommitteeName } from "@/lib/committee-meetings/slackCommittee";

function isCommitteeSlug(value: unknown): value is CommitteeSlug {
  return typeof value === "string" && value in COMMITTEE_LABELS;
}


export async function POST(request: NextRequest) {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerRole } = await session
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (callerRole?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, fullName, committee } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!isCommitteeSlug(committee)) {
    return NextResponse.json({ error: "A valid committee is required" }, { status: 400 });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = typeof fullName === "string" ? fullName.trim() : "";

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase service role is not configured" },
      { status: 503 },
    );
  }

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    trimmedEmail,
  );
  if (inviteError || !invited?.user) {
    return NextResponse.json(
      { error: inviteError?.message ?? "Failed to invite user" },
      { status: 400 },
    );
  }

  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: invited.user.id, role: "admin" });
  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  const { person: existingPerson } = await findPersonByEmail(admin, trimmedEmail);

  let personId = existingPerson?.id;
  if (personId) {
    if (!existingPerson?.full_name && trimmedName) {
      await admin.from("people").update({ full_name: trimmedName }).eq("id", personId);
    }
  } else {
    const { data: newPerson, error: personError } = await admin
      .from("people")
      .insert({ full_name: trimmedName || trimmedEmail, email: trimmedEmail })
      .select("id")
      .single();
    if (personError || !newPerson) {
      return NextResponse.json(
        { error: personError?.message ?? "Failed to create person record" },
        { status: 500 },
      );
    }
    personId = newPerson.id as string;
  }

  const { error: attendeeError } = await admin
    .from("committee_default_attendees")
    .upsert(
      { committee_slug: committee, person_id: personId },
      { onConflict: "committee_slug,person_id" },
    );
  if (attendeeError) {
    return NextResponse.json({ error: attendeeError.message }, { status: 500 });
  }

  const committeeLabel = COMMITTEE_LABELS[committee];
  await postToSlack(
    `:wave: ${trimmedEmail} was just invited to the admin dashboard and added to *${committeeLabel}*. Please add them to this Slack channel.`,
    slackCommitteeName(committee),
  );

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { processMembershipThankYouEmails } from "@/lib/membershipThankYouEmails";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.MEMBERSHIP_THANK_YOU_CRON_SECRET;
  if (!secret) return false;
  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let dryRun = false;
  let limit = 50;

  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.dryRun === "boolean") {
      dryRun = body.dryRun;
    }
    if (typeof body.limit === "number" && Number.isFinite(body.limit) && body.limit > 0) {
      limit = Math.min(Math.floor(body.limit), 200);
    }
  } catch {
    // Keep defaults when JSON body is missing or invalid.
  }

  try {
    const summary = await processMembershipThankYouEmails({
      dryRun,
      limit,
    });
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

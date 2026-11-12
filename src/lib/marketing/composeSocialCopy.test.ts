import { describe, expect, it } from "vitest";
import {
  CaptionTooLongError,
  composeSocialCopy,
  composeVerbatim,
} from "./composeSocialCopy";
import { composePlanVerbatim, finalizeEmailHtml, UNSUBSCRIBE_TAG } from "./composePlanCopy";
import { buildPlan } from "./planSchedule";

describe("composeVerbatim", () => {
  it("returns the exact text, trimmed only at the edges, for every platform", () => {
    expect(composeVerbatim("  Join us Oct 9!\n\nSee you there.  ", ["facebook", "instagram"])).toEqual({
      facebook: "Join us Oct 9!\n\nSee you there.",
      instagram: "Join us Oct 9!\n\nSee you there.",
    });
  });

  it("errors instead of truncating when over the Instagram limit", () => {
    const long = "x".repeat(2201);
    expect(() => composeVerbatim(long, ["instagram"])).toThrow(CaptionTooLongError);
    expect(composeVerbatim(long, ["facebook"]).facebook).toHaveLength(2201);
  });

  it("composeSocialCopy in verbatim mode never needs the model", async () => {
    const out = await composeSocialCopy({
      context: "Hello",
      verbatim: true,
      platforms: ["instagram"],
      voiceToneMarkdown: "",
    });
    expect(out.instagram).toBe("Hello");
  });
});

describe("plan copy helpers", () => {
  it("always ends emails with the unsubscribe tag", () => {
    expect(finalizeEmailHtml("<p>Hi</p>")).toContain(UNSUBSCRIBE_TAG);
    expect(finalizeEmailHtml(`<p>Hi</p><p><a href="${UNSUBSCRIBE_TAG}">Unsubscribe</a></p>`).split(UNSUBSCRIBE_TAG)).toHaveLength(2);
  });

  it("builds verbatim copy for every touch, escaping email html", () => {
    const { touches } = buildPlan({
      eventDay: "2026-10-09",
      today: "2026-09-30",
      intensity: "light",
      channels: ["facebook", "email"],
    });
    const copy = composePlanVerbatim("Tickets <now> & more", touches, "Gala");
    expect(copy).toHaveLength(touches.length);
    const email = copy.find((c) => c.html);
    expect(email?.html).toContain("Tickets &lt;now&gt; &amp; more");
    expect(email?.subject).toBe("Gala");
    expect(copy.find((c) => c.text)?.text).toBe("Tickets <now> & more");
  });
});

import { personalizeForDirectSend } from "./sendToPeople";

describe("personalizeForDirectSend", () => {
  const recipient = { id: "1", fullName: "Dana Reyes", email: "dana@example.com" };

  it("fills the greeting and drops the broadcast-only unsubscribe footer", () => {
    const out = personalizeForDirectSend(
      `<p>Hi {{{contact.first_name|there}}},</p><p>Join us.</p><p><a href="${UNSUBSCRIBE_TAG}">Unsubscribe</a></p>`,
      recipient,
    );
    expect(out).toContain("Hi Dana,");
    expect(out).not.toContain("RESEND_UNSUBSCRIBE_URL");
    expect(out).not.toContain("Unsubscribe");
  });
});

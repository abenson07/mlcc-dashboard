import { describe, expect, it } from "vitest";
import {
  buildVolunteerInterestMessage,
  classifyVolunteerInterest,
  escapeSlack,
} from "./volunteerInterestMessage";

const person = { name: "Pat Neighbor", contact: "pat@example.com" };

describe("classifyVolunteerInterest", () => {
  it("separates joining a committee from volunteer signups", () => {
    expect(classifyVolunteerInterest("join-card")).toBe("committee-join");
    expect(classifyVolunteerInterest(undefined)).toBe("committee-join");
    expect(classifyVolunteerInterest("volunteer-opportunity", "Day-of setup")).toBe(
      "volunteer-role",
    );
    expect(classifyVolunteerInterest("volunteer-opportunity", "  ")).toBe("volunteer-general");
    expect(classifyVolunteerInterest("volunteer-opportunity")).toBe("volunteer-general");
    expect(classifyVolunteerInterest("meeting-signup")).toBe("meeting-rsvp");
    expect(classifyVolunteerInterest("zoning-workshop")).toBe("zoning-workshop");
  });
});

describe("buildVolunteerInterestMessage", () => {
  it("labels a committee join with the committee", () => {
    const text = buildVolunteerInterestMessage({
      ...person,
      source: "join-card",
      committeeName: "Events",
    });
    expect(text).toContain("Wants to JOIN a committee:* Events");
    expect(text).toContain("*Committee:* Events");
    expect(text).toContain("*Name:* Pat Neighbor");
    expect(text).toContain("*Contact:* pat@example.com");
  });

  it("labels a specific volunteer role with role and committee", () => {
    const text = buildVolunteerInterestMessage({
      ...person,
      source: "volunteer-opportunity",
      opportunityTitle: "Day-of setup crew",
      committeeName: "Events",
    });
    expect(text).toContain("specific volunteer role:* Day-of setup crew");
    expect(text).toContain("*Role:* Day-of setup crew");
    expect(text).toContain("*Committee:* Events");
  });

  it("labels generic volunteer interest as having no specific role", () => {
    const text = buildVolunteerInterestMessage({
      ...person,
      source: "volunteer-opportunity",
      committeeName: "Advocacy",
    });
    expect(text).toContain("General volunteer interest* (no specific role)");
    expect(text).toContain("Advocacy");
    expect(text).not.toContain("*Role:*");
  });

  it("says when a signup is not tied to a committee", () => {
    const text = buildVolunteerInterestMessage({
      ...person,
      source: "volunteer-opportunity",
      opportunityTitle: "Secretary",
    });
    expect(text).toContain("*Committee:* Not tied to a specific committee");
  });

  it("escapes Slack control characters in user input", () => {
    expect(escapeSlack("<!channel> & co")).toBe("&lt;!channel&gt; &amp; co");
    const text = buildVolunteerInterestMessage({
      name: "<!channel>",
      contact: "a@b.c",
      source: "join-card",
      committeeName: "Events",
    });
    expect(text).not.toContain("<!channel>");
  });
});

"use client";

import { useState } from "react";
import { EmailFlow } from "./EmailFlow";
import { EventPlanFlow } from "./EventPlanFlow";
import { OutreachPicker } from "./OutreachPicker";
import { SocialPostFlow } from "./SocialPostFlow";

export type OutreachMode = "picker" | "social" | "email" | "plan";

/** Full-screen outreach composer. Same screens in demo and live; demo never calls Buffer, Resend, or Anthropic. */
export function OutreachOverlay({ demo, onClose }: { demo: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<OutreachMode>("picker");
  const flowProps = { demo, onClose, onBackToPicker: () => setMode("picker") };

  if (mode === "social") return <SocialPostFlow {...flowProps} />;
  if (mode === "email") return <EmailFlow {...flowProps} />;
  if (mode === "plan") return <EventPlanFlow {...flowProps} />;
  return <OutreachPicker onPick={setMode} onClose={onClose} />;
}

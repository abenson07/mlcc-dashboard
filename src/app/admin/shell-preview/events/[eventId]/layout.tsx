"use client";

import { use } from "react";
import { EventProvider } from "@/components/integrated/events/EventContext";

export default function ShellPreviewEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);

  return <EventProvider eventId={eventId}>{children}</EventProvider>;
}

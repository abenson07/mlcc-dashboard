import EventCmsForm from "@/components/events/EventCmsForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "New event",
  description: "Create a Webflow CMS event",
};

export default function NewEventPage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h1 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        New event
      </h1>
      <EventCmsForm />
    </div>
  );
}

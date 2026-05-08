import EventCmsForm from "@/components/events/EventCmsForm";
import { Metadata } from "next";
import React from "react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit event`,
    description: `Edit Webflow event ${id.slice(0, 8)}…`,
  };
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h1 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        Edit event
      </h1>
      <EventCmsForm itemId={id} />
    </div>
  );
}

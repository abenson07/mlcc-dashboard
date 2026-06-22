import EventDetailsContent from "@/components/integrated/events/EventDetailsContent";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventDetailsContent eventId={eventId} />;
}

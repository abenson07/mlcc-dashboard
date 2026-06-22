import EventOverviewPageContent from "@/components/integrated/events/EventOverviewPageContent";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventOverviewPageContent eventId={eventId} />;
}

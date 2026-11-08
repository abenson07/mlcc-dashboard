import { redirect } from "next/navigation";
import { LeafletsDemo } from "@/components/patterns/client-templates-migrate/leaflets";
import { CURRENT_LEAFLET_ID } from "@/lib/leaflets/currentLeaflet";

export default async function LeafletsRoute({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  const { all } = await searchParams;
  if (CURRENT_LEAFLET_ID && !all) redirect(`/admin/leaflets/${CURRENT_LEAFLET_ID}`);
  return <LeafletsDemo />;
}

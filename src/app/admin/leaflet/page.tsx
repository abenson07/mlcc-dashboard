"use client";

import NoActiveLeaflet from "@/components/leaflet/overview/NoActiveLeaflet";
import OverviewContent from "@/components/leaflet/overview/OverviewContent";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";

export default function LeafletOverviewPage() {
  const { activeLeaflet, leaflet, loading, error } = useLeafletContext();

  if (loading) {
    return <p className="lf-meta">Loading overview…</p>;
  }

  if (error) {
    return <p className="lf-text-red">{error}</p>;
  }

  if (!activeLeaflet && !leaflet) {
    return <NoActiveLeaflet />;
  }

  return <OverviewContent />;
}

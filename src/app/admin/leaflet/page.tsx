"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OverviewContent from "@/components/leaflet/overview/OverviewContent";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";

export default function ShellPreviewLeafletPage() {
  const { activeLeaflet, leaflet, loading, error } = useLeafletContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !activeLeaflet && !leaflet) {
      router.replace("/admin/leaflets");
    }
  }, [loading, activeLeaflet, leaflet, router]);

  if (loading) {
    return <p className="lf-meta">Loading overview…</p>;
  }

  if (error) {
    return <p className="lf-text-red">{error}</p>;
  }

  if (!activeLeaflet && !leaflet) {
    return null;
  }

  return <OverviewContent />;
}

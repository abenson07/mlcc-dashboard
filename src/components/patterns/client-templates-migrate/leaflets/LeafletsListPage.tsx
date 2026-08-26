"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useDemoGuard, useLeaflets } from "hooks";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Text } from "@/components/patterns/primitives/Text";
import { EmptyStateCard, useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { sampleLeaflets, type LeafletStatus, type LeafletSummary } from "@/data/mocks/leaflets";
import { toLeafletSummary } from "./adapters";

function statusLabel(status: LeafletStatus): string {
  if (status === "active") return "Active";
  if (status === "planned") return "Planned";
  return "Closed";
}

function groupByMonth(leaflets: LeafletSummary[]): [string, LeafletSummary[]][] {
  const groups = new Map<string, LeafletSummary[]>();
  for (const leaflet of leaflets) {
    const date = new Date(`${leaflet.distributionDate}T12:00:00`);
    const key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const bucket = groups.get(key);
    if (bucket) bucket.push(leaflet);
    else groups.set(key, [leaflet]);
  }
  return Array.from(groups.entries());
}

export type LeafletsListPageProps = {
  onCreateClick?: () => void;
};

/**
 * Leaflets list — month-grouped rows ported from the live admin's
 * `LeafletsListPageContent`, restyled with pattern-library primitives.
 */
export function LeafletsListPage({ onCreateClick }: LeafletsListPageProps = {}) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const { enabled: demo } = useDemoModeOptional();
  const { store } = useDemoGuard();
  const { leaflets, loading, error } = useLeaflets({ autoFetch: !demo });
  const summaries = useMemo(
    () => (demo ? store.merge<LeafletSummary>("leaflets", sampleLeaflets) : leaflets.map(toLeafletSummary)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demo, leaflets, store.version],
  );
  const byMonth = useMemo(() => groupByMonth(summaries), [summaries]);

  if (!demo && error) {
    return <Text color="secondary">Couldn&apos;t load leaflets: {error}</Text>;
  }
  if (!demo && loading) {
    return <Text color="secondary">Loading…</Text>;
  }

  if (summaries.length === 0) {
    return (
      <EmptyStateCard
        label="Add leaflet"
        icon={<Plus size={14} strokeWidth={1.75} />}
        onClick={onCreateClick}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {byMonth.map(([month, monthLeaflets]) => (
        <section key={month} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text size="sm" weight="semibold" color="secondary">
            {month}
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {monthLeaflets.map((leaflet) => {
              const date = new Date(`${leaflet.distributionDate}T12:00:00`);
              return (
                <button
                  key={leaflet.id}
                  type="button"
                  onClick={() => router.push(`${basePath}/leaflets/${leaflet.id}`)}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    width: "100%",
                    padding: 16,
                    background: "var(--linear-color-panel)",
                    border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
                    borderRadius: "var(--linear-radius-md)",
                    boxShadow: "var(--linear-shadow-panel)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      flexShrink: 0,
                    }}
                  >
                    <Text weight="semibold" style={{ fontSize: 18, lineHeight: "22px" }}>
                      {date.getDate()}
                    </Text>
                    <Text size="sm" color="secondary">
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </Text>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Text weight="medium">{leaflet.title}</Text>
                      <Badge label={statusLabel(leaflet.status)} />
                    </div>
                    <Text size="sm" color="secondary">
                      Distribution{" "}
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {leaflet.distributionDate2
                        ? ` and ${new Date(`${leaflet.distributionDate2}T12:00:00`).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}`
                        : ""}
                    </Text>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

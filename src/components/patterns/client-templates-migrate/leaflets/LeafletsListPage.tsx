"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDemoGuard, useLeaflets } from "hooks";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Text } from "@/components/patterns/primitives/Text";
import { EmptyStateCard, useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { sampleLeaflets, type LeafletStatus, type LeafletSummary } from "@/data/mocks/leaflets";
import { toLeafletSummary } from "./adapters";
import { Button } from "@/components/patterns/primitives/Button";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Modal } from "@/components/patterns/shared/Modal";
import { saveErrorMessage } from "@/lib/saveErrorMessage";
import { setDemoLeafletStatus } from "./demoLeafletStatus";
import { groupLeafletsForList } from "./leafletListGroups";

function LeafletRowActions({
  leaflet,
  onChangeStatus,
}: {
  leaflet: LeafletSummary;
  onChangeStatus: (status: "active" | "closed") => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown
      label={`Actions for ${leaflet.title}`}
      open={open}
      onOpenChange={setOpen}
      placement="below"
      alignment="end"
      portal
      trigger={
        <IconButton
          label={`Actions for ${leaflet.title}`}
          icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
          variant="ghost"
          size="sm"
        />
      }
    >
      <DropdownItem
        label="Mark active"
        disabled={leaflet.status === "active"}
        onSelect={() => {
          setOpen(false);
          onChangeStatus("active");
        }}
      />
      <DropdownItem
        label="Close leaflet issue"
        disabled={leaflet.status === "closed"}
        onSelect={() => {
          setOpen(false);
          onChangeStatus("closed");
        }}
      />
    </Dropdown>
  );
}

function statusLabel(status: LeafletStatus): string {
  if (status === "active") return "Active";
  if (status === "planned") return "Planned";
  return "Closed";
}

export type LeafletsListPageProps = {
  onCreateClick?: () => void;
};

/**
 * Leaflets list — active issue first, then month-grouped rows from the live admin's
 * `LeafletsListPageContent`, restyled with pattern-library primitives.
 */
export function LeafletsListPage({ onCreateClick }: LeafletsListPageProps = {}) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const { enabled: demo } = useDemoModeOptional();
  const { store, guard } = useDemoGuard();
  const { leaflets, loading, error, close, activate, refetch } = useLeaflets({ autoFetch: !demo });
  const [change, setChange] = useState<{
    leaflet: LeafletSummary;
    status: "active" | "closed";
    currentActive: LeafletSummary | null;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const busy = useRef(false);
  const summaries = useMemo(
    () => (demo ? store.merge<LeafletSummary>("leaflets", sampleLeaflets) : leaflets.map(toLeafletSummary)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demo, leaflets, store.version],
  );
  const groups = useMemo(() => groupLeafletsForList(summaries), [summaries]);

  function dismissChange() {
    if (!busy.current) setChange(null);
  }

  async function confirmChange() {
    if (!change || busy.current) return;
    busy.current = true;
    setSaving(true);
    setSaveError(null);
    const { leaflet, status, currentActive } = change;
    const expectedActiveId = currentActive?.id ?? null;
    const action = status === "active" ? "Leaflet issue activated" : "Leaflet issue closed";
    try {
      await guard(
        async () => {
          if (status === "active") await activate(leaflet.id, { expectedActiveId });
          else await close(leaflet.id, { activateNext: false });
        },
        {
          action,
          local: () => setDemoLeafletStatus(leaflet.id, status, expectedActiveId),
        },
      );
      if (!demo) toast.success(action);
      setChange(null);
    } catch (e) {
      setSaveError(saveErrorMessage(e, { fallback: "Couldn't change the leaflet status. Please try again." }));
      if (!demo) void refetch();
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

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
      {groups.map(([group, groupLeaflets]) => (
        <section key={group} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text size="sm" weight="semibold" color="secondary">
            {group}
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {groupLeaflets.map((leaflet) => {
              const date = new Date(`${leaflet.distributionDate}T12:00:00`);
              const isActive = leaflet.status === "active";
              return (
                <div
                  key={leaflet.id}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: isActive ? "wrap" : undefined,
                    gap: 16,
                    width: "100%",
                    padding: 16,
                    background: "var(--linear-color-panel)",
                    border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
                    borderRadius: "var(--linear-radius-md)",
                    outline: isActive ? "2px solid var(--color-success-400)" : undefined,
                    outlineOffset: isActive ? 2 : undefined,
                    boxShadow: isActive
                      ? "0 0 14px color-mix(in srgb, var(--color-success-400) 40%, transparent)"
                      : "var(--linear-shadow-panel)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => router.push(`${basePath}/leaflets/${leaflet.id}`)}
                    style={{
                      all: "unset",
                      display: "flex",
                      alignItems: "center",
                      flex: isActive ? "1 1 200px" : 1,
                      minWidth: 0,
                      gap: 16,
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
                  {isActive ? (
                    <a
                      href="https://mapleleafcommunity.org/leaflet/open-routes"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View open routes on Maple Leaf's public website (opens in a new tab)"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        flexShrink: 0,
                        marginLeft: "auto",
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                        background: "var(--linear-color-icon-button-secondary)",
                        color: "var(--linear-color-ink)",
                        fontSize: 13,
                        lineHeight: "20px",
                        fontWeight: 500,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
                      View open routes
                    </a>
                  ) : null}
                  <LeafletRowActions
                    leaflet={leaflet}
                    onChangeStatus={(status) => {
                      if (busy.current) return;
                      setSaveError(null);
                      setChange({
                        leaflet,
                        status,
                        currentActive: summaries.find((issue) => issue.status === "active") ?? null,
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <Modal
        isOpen={change !== null}
        onClose={dismissChange}
        title={change?.status === "active"
          ? change.currentActive ? "Close current issue and activate this one?" : "Mark leaflet issue active?"
          : "Close leaflet issue?"}
        footer={
          <>
            <Button label="Cancel" variant="secondary" disabled={saving} onClick={dismissChange} />
            <Button
              label={saving ? "Saving…" : change?.status === "active"
                ? change.currentActive ? "Close current & activate" : "Mark active"
                : "Close issue"}
              variant="primary"
              disabled={saving}
              onClick={() => void confirmChange()}
            />
          </>
        }
      >
        <Text size="sm" color="secondary">
          {change?.status === "active"
            ? change.currentActive
              ? `${change.currentActive.title} is currently active. Close it and make ${change.leaflet.title} the active issue instead?`
              : `Make ${change.leaflet.title} the active issue?`
            : `Close ${change?.leaflet.title}? It will remain in the list as Closed. This does not delete its data or activate another issue.`}
          {" "}No emails will be sent.
        </Text>
        {saveError ? <div role="alert"><Text size="sm" color="accent">{saveError}</Text></div> : null}
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDemoGuard, useLeaflets } from "hooks";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { SettingsRow } from "@/components/patterns/client-templates-migrate/settings/SettingsRow";
import { patchDemoEntity } from "@/lib/demo/demoStore";
import {
  offsetDescription,
  resolveCommSchedule,
  type LeafletCommSchedule,
} from "@/lib/leaflets/comm/commSchedule";
import type { CommSettings } from "@/types/database";

const rowInputStyle = {
  boxSizing: "border-box" as const,
  width: 260,
  height: 30,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
  textAlign: "right" as const,
};

function Divider() {
  return (
    <div
      style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }}
    />
  );
}

export type LeafletDetailsPanelProps = {
  leafletId: string;
  title: string;
  distributionDate: string;
  commSchedule: unknown;
  commSettings: CommSettings[];
};

export function LeafletDetailsPanel({
  leafletId,
  title: initialTitle,
  distributionDate: initialDistributionDate,
  commSchedule: storedSchedule,
  commSettings,
}: LeafletDetailsPanelProps) {
  const { enabled: demo, guard } = useDemoGuard();
  const { update } = useLeaflets({ autoFetch: false });
  const [title, setTitle] = useState(initialTitle);
  const [distributionDate, setDistributionDate] = useState(initialDistributionDate);
  const [schedule, setSchedule] = useState<LeafletCommSchedule>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseline, setBaseline] = useState("");

  const resolved = useMemo(
    () => resolveCommSchedule(storedSchedule, commSettings, initialDistributionDate),
    [storedSchedule, commSettings, initialDistributionDate],
  );

  useEffect(() => {
    setTitle(initialTitle);
    setDistributionDate(initialDistributionDate);
    setSchedule(resolved);
    setBaseline(
      JSON.stringify({
        title: initialTitle,
        distributionDate: initialDistributionDate,
        schedule: resolved,
      }),
    );
    setError(null);
  }, [initialTitle, initialDistributionDate, resolved]);

  const snapshot = JSON.stringify({ title, distributionDate, schedule });
  const dirty = snapshot !== baseline;

  function setStepDate(stepKey: string, value: string) {
    setSchedule((prev) => ({ ...prev, [stepKey]: value }));
  }

  async function persist() {
    if (!leafletId || saving) return;
    setSaving(true);
    setError(null);
    try {
      await guard(
        async () => {
          await update(leafletId, {
            title: title.trim() || initialTitle,
            distribution_date: distributionDate,
            comm_schedule: schedule,
          });
        },
        {
          action: "Leaflet settings saved",
          local: () => {
            patchDemoEntity("leaflets", leafletId, {
              title: title.trim() || initialTitle,
              distributionDate,
              comm_schedule: schedule,
            });
          },
        },
      );
      if (!demo) toast.success("Leaflet settings saved");
      setBaseline(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "48px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 760, marginInline: "auto" }}>
        <VStack gap={8}>
          <Heading level={1}>Leaflet settings</Heading>

          <VStack gap={3}>
            <Text type="label" color="secondary">
              Leaflet details
            </Text>
            <Card padding={4}>
              <VStack gap={4}>
                <SettingsRow
                  label="Title"
                  description="Name of this edition"
                  control={
                    <input
                      style={rowInputStyle}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  }
                />
                <Divider />
                <SettingsRow
                  label="Distribution date"
                  description="Anchor date for this leaflet"
                  control={
                    <input
                      type="date"
                      style={rowInputStyle}
                      value={distributionDate}
                      onChange={(e) => setDistributionDate(e.target.value)}
                    />
                  }
                />
              </VStack>
            </Card>
          </VStack>

          <VStack gap={3}>
            <Text type="label" color="secondary">
              Deliverer emails
            </Text>
            <Card padding={4}>
              <VStack gap={4}>
                {commSettings.map((setting, index) => (
                  <div key={setting.id}>
                    {index > 0 ? (
                      <div style={{ marginBottom: 16 }}>
                        <Divider />
                      </div>
                    ) : null}
                    <SettingsRow
                      label={setting.name}
                      description={offsetDescription(setting.offset_days, setting.step_key)}
                      control={
                        <input
                          type="date"
                          style={rowInputStyle}
                          value={schedule[setting.step_key] ?? ""}
                          onChange={(e) => setStepDate(setting.step_key, e.target.value)}
                        />
                      }
                    />
                  </div>
                ))}
              </VStack>
            </Card>
          </VStack>

          {error ? <Text color="accent">{error}</Text> : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button
              label={saving ? "Saving…" : "Save changes"}
              variant="primary"
              disabled={!dirty || saving}
              onClick={() => {
                void persist();
              }}
            />
          </div>
        </VStack>
      </div>
    </div>
  );
}

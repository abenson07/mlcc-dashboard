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
import { LinearDatePicker } from "@/components/patterns/primitives/LinearDatePicker";
import { addDaysToIsoDate } from "@/components/leaflet/leafletData";
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

const pickerWrap = { width: 260 } as const;

function DateControl({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={pickerWrap}>
      <LinearDatePicker
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size="compact"
      />
    </div>
  );
}

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
  distributionDate2?: string | null;
  commSchedule: unknown;
  commSettings: CommSettings[];
};

export function LeafletDetailsPanel({
  leafletId,
  title: initialTitle,
  distributionDate: initialDistributionDate,
  distributionDate2: initialDistributionDate2 = null,
  commSchedule: storedSchedule,
  commSettings,
}: LeafletDetailsPanelProps) {
  const { enabled: demo, guard } = useDemoGuard();
  const { update } = useLeaflets({ autoFetch: false });
  const [title, setTitle] = useState(initialTitle);
  const [distributionDate, setDistributionDate] = useState(initialDistributionDate);
  const [distributionDate2, setDistributionDate2] = useState(initialDistributionDate2 ?? "");
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
    setDistributionDate2(initialDistributionDate2 ?? "");
    setSchedule(resolved);
    setBaseline(
      JSON.stringify({
        title: initialTitle,
        distributionDate: initialDistributionDate,
        distributionDate2: initialDistributionDate2 ?? "",
        schedule: resolved,
      }),
    );
    setError(null);
  }, [initialTitle, initialDistributionDate, initialDistributionDate2, resolved]);

  const snapshot = JSON.stringify({ title, distributionDate, distributionDate2, schedule });
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
            distribution_date_2: distributionDate2.trim() ? distributionDate2.trim() : null,
            comm_schedule: schedule,
          });
        },
        {
          action: "Leaflet settings saved",
          local: () => {
            patchDemoEntity("leaflets", leafletId, {
              title: title.trim() || initialTitle,
              distributionDate,
              distributionDate2: distributionDate2.trim() ? distributionDate2 : null,
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
                  description="When leaflets hit doorsteps or are available for pickup"
                  control={
                    <DateControl value={distributionDate} onChange={setDistributionDate} />
                  }
                />
                <Divider />
                <SettingsRow
                  label="Second distribution date"
                  description="Optional weekday or follow-up drop"
                  control={
                    distributionDate2 ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <DateControl value={distributionDate2} onChange={setDistributionDate2} />
                        <button
                          type="button"
                          onClick={() => setDistributionDate2("")}
                          style={{
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            color: "var(--linear-color-ink-subtle)",
                            fontSize: 12,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setDistributionDate2(
                            distributionDate ? addDaysToIsoDate(distributionDate, 5) : "",
                          )
                        }
                        style={{
                          padding: 0,
                          border: "none",
                          background: "transparent",
                          color: "var(--linear-color-ink)",
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textDecoration: "underline",
                        }}
                      >
                        Add a second date
                      </button>
                    )
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
                        <DateControl
                          value={schedule[setting.step_key] ?? ""}
                          onChange={(next) => setStepDate(setting.step_key, next)}
                          placeholder="Send date"
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

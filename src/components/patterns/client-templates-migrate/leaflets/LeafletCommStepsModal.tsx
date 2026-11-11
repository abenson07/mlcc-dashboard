"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDemoGuard } from "hooks";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HoverTooltip } from "@/components/patterns/primitives/HoverTooltip";
import { Text } from "@/components/patterns/primitives/Text";
import { DetailSelectField } from "@/components/patterns/foundation/detail/DetailSelectField";
import { getApiBase } from "@/lib/apiBase";
import { isUnconfirmedOnlyStep } from "@/lib/leaflets/comm/commSchedule";
import { formatSendDate } from "@/lib/leaflets/comm/commSends";
import {
  actionUrlTooltip,
  firstNameFromFullName,
  formatLeafletCommDate,
  leafletCommCopy,
  type LeafletCommSegment,
  type LeafletCommVariableKey,
} from "@/lib/leaflets/comm/leafletCommTemplate";
import type { CommStage } from "@/components/leaflet/types";
import type { LeafletDelivererRow } from "@/data/mocks/leaflets";

export type LeafletCommStepsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  leafletId: string;
  leafletTitle: string;
  distributionDate: string;
  stages: CommStage[];
  deliverers: LeafletDelivererRow[];
  recipientCountByStep: Record<string, number>;
  /** When set, send only to this deliverer via the resend route. */
  personId?: string | null;
  /** For a one-person send: newest send time (ISO) per template for that deliverer. */
  personSends?: Record<string, string>;
  /**
   * When set, send only to these deliverers (a bulk selection). The send is
   * held for a few seconds behind an Undo toast before anything goes out.
   */
  personIds?: string[] | null;
  /** `recipientIds` is set for a bulk selection send. */
  onSent?: (stepKey: string, recipientIds?: string[]) => void | Promise<void>;
};

/** How long a bulk send waits for Undo before emails go out. */
const UNDO_SEND_DELAY_MS = 5000;

function pickSamplePerson(
  deliverers: LeafletDelivererRow[],
  personId: string | null | undefined,
): LeafletDelivererRow | null {
  if (personId) {
    const locked = deliverers.find((d) => d.id === personId);
    if (locked) return locked;
  }
  return deliverers.find((d) => d.email.trim()) ?? deliverers[0] ?? null;
}

function defaultStepKey(stages: CommStage[]): string | null {
  const unsent = stages.find((s) => s.state !== "completed" && s.stepKey);
  return unsent?.stepKey ?? stages.find((s) => s.stepKey)?.stepKey ?? null;
}

function routeLinesForPerson(person: LeafletDelivererRow | null): string {
  if (!person || person.routes.length === 0) return "No routes assigned";
  return person.routes
    .map((r) => {
      const count = r.leafletCount != null ? ` (${r.leafletCount} households)` : "";
      return `${r.name}${count}`;
    })
    .join("\n");
}

function variableTooltip(params: {
  key: LeafletCommVariableKey;
  person: LeafletDelivererRow | null;
  leafletTitle: string;
  distributionDate: string;
}): string {
  const { key, person, leafletTitle, distributionDate } = params;
  const name = person?.name ?? "this deliverer";
  switch (key) {
    case "firstName":
      return firstNameFromFullName(name);
    case "leafletTitle":
      return leafletTitle;
    case "distributionDate":
      return formatLeafletCommDate(distributionDate) || "Distribution date";
    case "routes":
      return routeLinesForPerson(person);
    case "actionUrl":
      return actionUrlTooltip(name);
  }
}

function VariableChip({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) {
  return (
    <HoverTooltip content={tooltip}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          height: 22,
          paddingInline: 8,
          borderRadius: 999,
          background: "var(--linear-color-sidebar-item-selected)",
          color: "var(--linear-color-ink)",
          fontSize: 12,
          lineHeight: "16px",
          whiteSpace: "nowrap",
          cursor: "help",
          marginInline: 4,
          boxShadow: "inset 0 0 0 1px var(--linear-color-hairline)",
        }}
      >
        {`{${label}}`}
      </span>
    </HoverTooltip>
  );
}

function SegmentLine({
  segments,
  tooltipFor,
}: {
  segments: LeafletCommSegment[];
  tooltipFor: (key: LeafletCommVariableKey, label: string) => string;
}) {
  return (
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "var(--linear-color-ink)" }}>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <VariableChip key={i} label={seg.label} tooltip={tooltipFor(seg.key, seg.label)} />
        ),
      )}
    </p>
  );
}

export function LeafletCommStepsModal({
  isOpen,
  onClose,
  leafletId,
  leafletTitle,
  distributionDate,
  stages,
  deliverers,
  recipientCountByStep,
  personId = null,
  personSends,
  personIds = null,
  onSent,
}: LeafletCommStepsModalProps) {
  const { enabled: demo, sendDemoEmail } = useDemoGuard();
  const [stepKey, setStepKey] = useState<string | null>(null);
  const [samplePerson, setSamplePerson] = useState<LeafletDelivererRow | null>(null);
  const [confirmResend, setConfirmResend] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStepKey(defaultStepKey(stages));
    setSamplePerson(pickSamplePerson(deliverers, personId ?? personIds?.[0]));
    setConfirmResend(false);
    setError(null);
    setSending(false);
    // Snapshot deliverers/stages at open so switching templates does not reset selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const selected = stages.find((s) => s.stepKey === stepKey) ?? null;
  const copy = leafletCommCopy(stepKey ?? "");
  const singlePerson = Boolean(personId);
  const groupRecipients = useMemo(
    () => (personIds && !singlePerson ? deliverers.filter((d) => personIds.includes(d.id)) : null),
    [personIds, singlePerson, deliverers],
  );
  const isGroup = groupRecipients != null;
  // A one-person send is judged by what this deliverer was sent, not the edition-wide flag.
  const personSentAt = singlePerson && stepKey ? personSends?.[stepKey] : undefined;
  const alreadySent = isGroup ? false : singlePerson ? Boolean(personSentAt) : selected?.state === "completed";
  const recipientCount = isGroup
    ? groupRecipients.length
    : singlePerson
      ? 1
      : (stepKey ? (recipientCountByStep[stepKey] ?? 0) : 0);
  const recipientNoun = recipientCount === 1 ? "deliverer" : "deliverers";
  const audienceNote = !singlePerson && !isGroup && isUnconfirmedOnlyStep(stepKey ?? "")
    ? " who have not confirmed"
    : "";

  const options = useMemo(
    () =>
      stages
        .filter((s) => s.stepKey)
        .map((s) => ({ value: s.stepKey as string, label: s.name })),
    [stages],
  );

  function tooltipFor(key: LeafletCommVariableKey) {
    return variableTooltip({
      key,
      person: samplePerson,
      leafletTitle,
      distributionDate,
    });
  }

  async function sendNow() {
    if (!stepKey || sending) return;
    setSending(true);
    setError(null);
    try {
      const stageName = selected?.name ?? "email";
      if (demo) {
        await sendDemoEmail({
          subject: `${stageName} — ${leafletTitle}`,
          text: `Demo send of "${stageName}" for ${leafletTitle}.`,
          context: singlePerson
            ? samplePerson?.name ?? "1 deliverer"
            : `${recipientCount} ${recipientNoun}${audienceNote}`,
        });
        await onSent?.(stepKey);
        onClose();
        return;
      }

      if (singlePerson && personId) {
        const res = await fetch(`${getApiBase()}/api/leaflets/${encodeURIComponent(leafletId)}/comm/resend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personId, stepKey }),
        });
        const data = (await res.json()) as { error?: string; sent?: number };
        if (!res.ok) throw new Error(data.error ?? "Failed to send");
        toast.success(`Sent to ${samplePerson?.name ?? "deliverer"}`);
      } else {
        const res = await fetch(
          `${getApiBase()}/api/leaflets/${encodeURIComponent(leafletId)}/comm/${encodeURIComponent(stepKey)}/send`,
          { method: "POST" },
        );
        const data = (await res.json()) as { error?: string; sent?: number };
        if (!res.ok) throw new Error(data.error ?? "Failed to send");
        toast.success(`Sent ${data.sent ?? 0} email${(data.sent ?? 0) === 1 ? "" : "s"}`);
      }
      await onSent?.(stepKey);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  /** Bulk send: close now, wait behind an Undo toast, then send one by one. */
  function sendToGroup() {
    if (!stepKey || !groupRecipients || groupRecipients.length === 0) return;
    const key = stepKey;
    const recipients = groupRecipients;
    const stageName = selected?.name ?? "email";
    const who = `${recipients.length} ${recipients.length === 1 ? "deliverer" : "deliverers"}`;
    let cancelled = false;
    const toastId = toast(`Sending "${stageName}" to ${who}…`, {
      duration: UNDO_SEND_DELAY_MS,
      action: {
        label: "Undo",
        onClick: () => {
          cancelled = true;
          toast(`Cancelled — nothing was sent to ${who}`);
        },
      },
    });
    onClose();

    window.setTimeout(() => {
      if (cancelled) return;
      toast.dismiss(toastId);
      void (async () => {
        try {
          if (demo) {
            await sendDemoEmail({
              subject: `${stageName} — ${leafletTitle}`,
              text: `Demo send of "${stageName}" for ${leafletTitle}.`,
              context: recipients.map((r) => r.name).join(", "),
            });
            await onSent?.(key, recipients.map((r) => r.id));
            return;
          }
          const results = await Promise.allSettled(
            recipients.map(async (r) => {
              const res = await fetch(
                `${getApiBase()}/api/leaflets/${encodeURIComponent(leafletId)}/comm/resend`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ personId: r.id, stepKey: key }),
                },
              );
              const data = (await res.json()) as { error?: string };
              if (!res.ok) throw new Error(`${r.name}: ${data.error ?? "Failed to send"}`);
              return r.id;
            }),
          );
          const sentIds = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
          const failures = results.flatMap((r) =>
            r.status === "rejected" ? [r.reason instanceof Error ? r.reason.message : "Failed to send"] : [],
          );
          if (sentIds.length > 0) {
            toast.success(`Sent to ${sentIds.length} ${sentIds.length === 1 ? "deliverer" : "deliverers"}`);
          }
          if (failures.length > 0) {
            toast.error(`${failures.length} not sent`, { description: failures.join("\n") });
          }
          await onSent?.(key, sentIds);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Failed to send");
        }
      })();
    }, UNDO_SEND_DELAY_MS);
  }

  function handleSendClick() {
    if (isGroup) {
      sendToGroup();
      return;
    }
    if (alreadySent && !confirmResend) {
      setConfirmResend(true);
      return;
    }
    void sendNow();
  }

  const statusLabel = isGroup
    ? `${recipientCount} selected`
    : singlePerson
    ? personSentAt
      ? `Sent ${formatSendDate(personSentAt)}`
      : "Not sent"
    : alreadySent
      ? selected?.sentDate
        ? `Sent ${selected.sentDate}`
        : "Sent"
      : "Not sent";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        singlePerson
          ? `Email ${samplePerson?.name ?? "deliverer"}`
          : isGroup
            ? `Email ${recipientCount} ${recipientNoun}`
            : "Deliverer emails"
      }
      width={640}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          <Button
            label={
              sending
                ? "Sending…"
                : alreadySent && confirmResend
                  ? "Send anyway"
                  : "Send"
            }
            variant="primary"
            disabled={!stepKey || sending || recipientCount === 0}
            onClick={handleSendClick}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <DetailSelectField
              label="Template"
              value={stepKey}
              options={options}
              onCommit={(next) => {
                setStepKey(next);
                setConfirmResend(false);
                setError(null);
              }}
            />
          </div>
          <div style={{ paddingBottom: 4 }}>
            <Badge label={statusLabel} />
          </div>
        </div>

        <Text size="sm" color="secondary">
          {confirmResend && alreadySent
            ? `Already sent this edition. Send again to ${recipientCount} ${recipientNoun}${audienceNote}?`
            : `This sends to ${recipientCount} ${recipientNoun}${audienceNote}.`}
        </Text>

        {groupRecipients ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              maxHeight: 112,
              overflow: "auto",
            }}
          >
            {groupRecipients.map((r) => (
              <span
                key={r.id}
                title={r.name}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 24,
                  paddingInline: 8,
                  borderRadius: 999,
                  background: "var(--linear-color-sidebar-item-selected)",
                  boxShadow: "inset 0 0 0 1px var(--linear-color-hairline)",
                  fontSize: 12,
                  color: r.email.trim() ? "var(--linear-color-ink)" : "var(--linear-color-ink-subtle)",
                  whiteSpace: "nowrap",
                }}
              >
                {r.email.trim() || `${r.name} — no email`}
              </span>
            ))}
          </div>
        ) : null}

        <div
          key={stepKey ?? "none"}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 16,
            borderRadius: 8,
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            background: "var(--linear-color-panel)",
          }}
        >
          <Text size="sm" color="secondary" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Maple Leaf Community Council
          </Text>
          <Text weight="semibold" size="md">
            {copy.heading}
          </Text>
          <SegmentLine segments={copy.greeting} tooltipFor={tooltipFor} />
          <SegmentLine segments={copy.intro} tooltipFor={tooltipFor} />
          <Text size="sm" color="secondary" weight="medium">
            {copy.routesHeading}
          </Text>
          <VariableChip label="Routes" tooltip={tooltipFor("routes")} />
          {copy.closing ? (
            <Text size="sm" color="secondary">
              {copy.closing}
            </Text>
          ) : null}
          {copy.actionLabel ? (
            <>
              <div>
                <VariableChip label="Action link" tooltip={tooltipFor("actionUrl")} />
                <span style={{ marginLeft: 8, fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>
                  {copy.actionLabel}
                </span>
              </div>
              <Text size="sm" color="secondary">
                {copy.pasteLinkLead}
              </Text>
              <VariableChip label="Action link" tooltip={tooltipFor("actionUrl")} />
            </>
          ) : null}
        </div>

        {error ? (
          <Text size="sm" color="secondary">
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { Card } from "@/components/patterns/primitives/Card";
import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { SettingsRow } from "@/components/patterns/client-templates-migrate/settings/SettingsRow";
import {
  eventsListBasePath,
  formatEventTimeRange,
} from "@/lib/events/eventData";
import { eventPageUrl } from "@/lib/events/eventQr";
import { useEventContext } from "./EventContext";
import { EventQrCodesSection } from "./EventQrCodesSection";

function Divider() {
  return (
    <div
      style={{ height: 1, background: "var(--linear-color-hairline)", marginInline: -16 }}
    />
  );
}

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

/** Convert ISO timestamp → value for `<input type="datetime-local">`. */
function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function EventDetailsPanel({
  topBanner,
}: {
  /** Optional notice above the details heading (admin-migrate draft banner). */
  topBanner?: ReactNode;
}) {
  const pathname = usePathname();
  const {
    event,
    loading,
    readOnly,
    updateEvent,
    uploadCoverImage,
    publishEvent,
    unpublishEvent,
  } = useEventContext();

  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (event && !initialized) {
    setName(event.title);
    setStartsAt(toDatetimeLocalValue(event.starts_at));
    setEndsAt(toDatetimeLocalValue(event.ends_at));
    setLocation(event.fieldData.location ?? "");
    setAddress(event.fieldData.address ?? "");
    setCapacity(event.fieldData.capacity != null ? String(event.fieldData.capacity) : "");
    setDescription(event.fieldData.description ?? "");
    setInitialized(true);
  }

  if (loading && !event) {
    return <Text color="secondary">Loading event…</Text>;
  }

  if (!event) {
    return (
      <VStack gap={3}>
        <Heading level={2}>Event not found</Heading>
        <Link href={eventsListBasePath(pathname)} className="lf-link">
          Back to events
        </Link>
      </VStack>
    );
  }

  const fd = event.fieldData;
  const isPublished = event.publishStatus === "published";
  const publicUrl = eventPageUrl(event.slug);
  const timeRange = formatEventTimeRange({
    id: event.id,
    name: event.title,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    date: null,
    event_template_id: event.event_template_id,
    slug: event.slug,
    field_data: fd,
    publish_status: event.publishStatus,
    created_at: "",
    updated_at: "",
  });

  async function handleSave() {
    if (readOnly) return;
    setSaving(true);
    setError(null);
    try {
      const nextStarts = fromDatetimeLocalValue(startsAt);
      const nextEnds = fromDatetimeLocalValue(endsAt);
      await updateEvent({
        name: name.trim(),
        starts_at: nextStarts,
        ends_at: nextEnds,
        date: nextStarts ? nextStarts.slice(0, 10) : null,
        field_data: {
          ...fd,
          location: location.trim(),
          address: address.trim(),
          capacity: capacity ? Number(capacity) : undefined,
          description: description.trim(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || readOnly) return;

    setUploadingImage(true);
    setError(null);
    try {
      const url = await uploadCoverImage(file);
      await updateEvent({ field_data: { ...fd, image_url: url } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleTogglePublish() {
    if (readOnly) return;
    setPublishing(true);
    setError(null);
    try {
      if (isPublished) {
        await unpublishEvent();
      } else {
        await publishEvent();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update publish status");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUpdateFieldData(next: Record<string, unknown>) {
    await updateEvent({ field_data: next });
  }

  return (
    <div style={{ maxWidth: 760, marginInline: "auto", padding: "48px 24px 64px" }}>
      <VStack gap={8}>
        {topBanner}
        <Heading level={1}>Event settings</Heading>

        <VStack gap={3}>
          <Text type="label" color="secondary">
            Event details
          </Text>
          <Card padding={4}>
            <VStack gap={4}>
              <SettingsRow
                label="Event name"
                description="Shown on the event page"
                control={
                  <input
                    style={rowInputStyle}
                    value={name}
                    disabled={readOnly}
                    onChange={(e) => setName(e.target.value)}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Starts"
                description="Start date and time"
                control={
                  <input
                    type="datetime-local"
                    style={rowInputStyle}
                    value={startsAt}
                    disabled={readOnly}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Ends"
                description="End date and time"
                control={
                  <input
                    type="datetime-local"
                    style={rowInputStyle}
                    value={endsAt}
                    disabled={readOnly}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Schedule"
                description="Formatted for the site"
                control={
                  <Text color="secondary" style={{ textAlign: "right", maxWidth: 280 }}>
                    {event.distributionLabel}
                    {timeRange !== "—" ? ` · ${timeRange}` : ""}
                  </Text>
                }
              />
              <Divider />
              <SettingsRow
                label="Location"
                description="General park or venue name"
                control={
                  <input
                    style={rowInputStyle}
                    value={location}
                    disabled={readOnly}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Address"
                description="Street address for maps"
                control={
                  <input
                    style={rowInputStyle}
                    value={address}
                    disabled={readOnly}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                }
              />
              <Divider />
              <SettingsRow
                label="Capacity"
                description="Maximum attendees"
                control={
                  <input
                    type="number"
                    style={rowInputStyle}
                    value={capacity}
                    disabled={readOnly}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                }
              />
            </VStack>
          </Card>
        </VStack>

        <VStack gap={3}>
          <Text type="label" color="secondary">
            Website details
          </Text>
          <Card padding={4}>
            <VStack gap={4}>
              <SettingsRow
                label="Public URL"
                description="Slug used on the marketing site"
                control={
                  publicUrl ? (
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "var(--linear-color-accent)",
                        fontSize: 13,
                        textAlign: "right",
                        maxWidth: 280,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      /events/{event.slug}
                    </a>
                  ) : (
                    <Text color="secondary">No slug yet</Text>
                  )
                }
              />
              <Divider />
              <SettingsRow
                label="Cover image"
                description="Main image for the event page"
                control={
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {fd.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fd.image_url}
                        alt=""
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          objectFit: "cover",
                          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          background: "var(--linear-color-icon-button-secondary)",
                          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                        }}
                      />
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={readOnly || uploadingImage}
                      onChange={(e) => void handleImageChange(e)}
                    />
                    <Button
                      label={uploadingImage ? "Uploading…" : "Change image"}
                      onClick={() => {
                        if (!uploadingImage) fileInputRef.current?.click();
                      }}
                    />
                  </div>
                }
              />
              <Divider />
              <SettingsRow
                label="Description"
                description="Promotional copy for the event page"
                control={
                  <textarea
                    style={{
                      ...rowInputStyle,
                      width: 320,
                      height: 72,
                      textAlign: "left",
                      resize: "vertical" as const,
                    }}
                    value={description}
                    disabled={readOnly}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                }
              />
            </VStack>
          </Card>
        </VStack>

        <VStack gap={3}>
          <Text type="label" color="secondary">
            Published status
          </Text>
          <Card padding={4}>
            <SettingsRow
              label={isPublished ? "Published" : "Draft"}
              description={
                isPublished
                  ? "This event is public on the website"
                  : "This event is not yet public on the website"
              }
              control={
                <Button
                  label={
                    publishing
                      ? isPublished
                        ? "Unpublishing…"
                        : "Publishing…"
                      : isPublished
                        ? "Unpublish"
                        : "Publish"
                  }
                  variant={isPublished ? "secondary" : "primary"}
                  onClick={() => {
                    if (!publishing && !readOnly) void handleTogglePublish();
                  }}
                />
              }
            />
          </Card>
        </VStack>

        <EventQrCodesSection
          fieldData={fd}
          eventSlug={event.slug}
          eventName={event.title}
          readOnly={readOnly}
          onUpdateFieldData={handleUpdateFieldData}
        />

        {error && <Text color="accent">{error}</Text>}

        {!readOnly && (
          <div>
            <Button
              label={saving ? "Saving…" : "Save changes"}
              variant="primary"
              onClick={() => {
                if (!saving) void handleSave();
              }}
            />
          </div>
        )}
      </VStack>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useEvents } from "hooks";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { RichTextEditor } from "@/components/patterns/client-templates-migrate/content/RichTextEditor";
import { imageRequiredForService, validateImageDimensions } from "@/lib/buffer/imageSpecs";
import {
  buildPlan,
  daysBetween,
  pacificNineAmIso,
  toPacificDay,
  type PlanIntensity,
} from "@/lib/marketing/planSchedule";
import { composePlan, publishItems, type PublishItem } from "./api";
import { ChangeImageModal } from "./ChangeImageModal";
import { EditContentModal } from "./EditContentModal";
import { OutreachImageSlot } from "./OutreachImageSlot";
import { PlatformPreview } from "./OutreachPreviews";
import { OutreachShell, PreviewPlaceholder } from "./OutreachShell";
import { PostMenu } from "./PostMenu";
import {
  ChipToggle,
  ChoicePill,
  ErrorText,
  Hint,
  RadioCard,
  SectionLabel,
  StepFooter,
  TextArea,
  TextField,
  fieldStyle,
} from "./ui";
import {
  AUDIENCE_LABEL,
  PLATFORM_LABEL,
  type EmailAudienceChoice,
  type OutreachFlowProps,
  type PlanChannel,
  type SocialPlatform,
  type TouchDraft,
  type UploadedImage,
} from "./types";

const STEPS = ["Event", "Images", "Review plan"];
const CHANNELS: PlanChannel[] = ["facebook", "instagram", "email"];
const INTENSITIES: { value: PlanIntensity; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "standard", label: "Standard" },
  { value: "heavy", label: "Heavy" },
];
const KIND_LABEL: Record<string, string> = {
  announcement: "Announcement",
  reminder: "Reminder",
  "day-before": "Day-before",
  "day-of": "Day-of",
};
const AUDIENCES: EmailAudienceChoice[] = ["all", "donors", "volunteers"];

function dayLabel(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Monday of the week containing `day`, as `YYYY-MM-DD`. */
function weekStart(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const offset = (date.getUTCDay() + 6) % 7;
  return new Date(date.getTime() - offset * 86400000).toISOString().slice(0, 10);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function withHeaderImage(html: string, image?: UploadedImage | null): string {
  return image ? `<p><img src="${image.url}" alt=""></p>\n${html}` : html;
}

export function EventPlanFlow({ demo, onClose, onBackToPicker }: OutreachFlowProps) {
  const { eventRows, loading: eventsLoading } = useEvents();
  const today = toPacificDay(new Date());

  const upcoming = useMemo(
    () =>
      eventRows
        .filter((e) => e.name && e.starts_at && toPacificDay(e.starts_at) >= today)
        .sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? "")),
    [eventRows, today],
  );

  const [step, setStep] = useState(0);
  const [eventId, setEventId] = useState("");
  const [channels, setChannels] = useState<PlanChannel[]>(["facebook", "instagram", "email"]);
  const [intensity, setIntensity] = useState<PlanIntensity>("standard");
  const [context, setContext] = useState("");
  const [verbatim, setVerbatim] = useState(false);
  const [images, setImages] = useState<Record<PlanChannel, UploadedImage[]>>({ facebook: [], instagram: [], email: [] });
  const [reuse, setReuse] = useState(false);
  const [touches, setTouches] = useState<TouchDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [changingImage, setChangingImage] = useState(false);

  const event = upcoming.find((e) => e.id === eventId);
  const eventDay = event?.starts_at ? toPacificDay(event.starts_at) : null;
  const preview = useMemo(
    () => (eventDay && channels.length > 0 ? buildPlan({ eventDay, today, intensity, channels }) : null),
    [eventDay, today, intensity, channels],
  );
  const library = useMemo(
    () => [...new Map(Object.values(images).flat().map((i) => [i.url, i])).values()],
    [images],
  );
  const selected = touches.find((t) => t.id === selectedId) ?? touches[0];

  function toggleChannel(c: PlanChannel, on: boolean) {
    setChannels((cur) => (on ? [...cur, c] : cur.filter((x) => x !== c)));
  }

  function addImage(channel: PlanChannel, img: UploadedImage | null) {
    if (!img) return;
    setImages((cur) => {
      if (reuse) return Object.fromEntries(channels.map((c) => [c, [...cur[c], img]])) as Record<PlanChannel, UploadedImage[]>;
      return { ...cur, [channel]: [...cur[channel], img] };
    });
  }

  function removeImage(channel: PlanChannel, url: string) {
    setImages((cur) => ({ ...cur, [channel]: cur[channel].filter((i) => i.url !== url) }));
  }

  function patchTouch(id: string, patch: Partial<TouchDraft>) {
    setTouches((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function buildDrafts() {
    if (!event?.starts_at || !event.name) return;
    setBusy(true);
    setError(null);
    try {
      const drafts = await composePlan(
        {
          eventId: event.id,
          eventName: event.name,
          eventStartsAt: event.starts_at,
          channels,
          intensity,
          context,
          verbatim,
        },
        demo,
      );
      // Spread each channel's library across its touches in order.
      const seen: Record<string, number> = {};
      const withImages = drafts.map((t) => {
        const lib = images[t.channel];
        const idx = seen[t.channel] ?? 0;
        seen[t.channel] = idx + 1;
        return { ...t, image: lib.length > 0 ? lib[idx % lib.length] : null };
      });
      setTouches(withImages);
      setSelectedId(withImages[0]?.id ?? null);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build the plan.");
    } finally {
      setBusy(false);
    }
  }

  async function approveAll() {
    const missing = touches.filter((t) => t.channel !== "email" && imageRequiredForService(t.channel as SocialPlatform) && !t.image);
    if (missing.length > 0) {
      setError(`Add an image to: ${missing.map((t) => `${dayLabel(t.date)} ${PLATFORM_LABEL[t.channel]}`).join(", ")}.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const items: PublishItem[] = touches.map((t) => {
        // 9am Pacific on the touch's day, or right away if that moment has already passed.
        const nineAm = pacificNineAmIso(t.date);
        const when = t.date > today && Date.parse(nineAm) > Date.now() ? { mode: "at" as const, at: nineAm } : { mode: "now" as const };
        if (t.channel === "email") {
          return {
            id: t.id,
            channel: "email",
            when,
            subject: t.subject,
            html: withHeaderImage(t.html ?? "", t.image),
            audience: t.audience,
          };
        }
        return {
          id: t.id,
          channel: t.channel,
          when,
          text: t.text,
          imageUrl: t.image?.url,
          imageWidth: t.image?.width,
          imageHeight: t.image?.height,
        };
      });
      const results = await publishItems(items, demo);
      const failed = results.filter((r) => !r.ok);
      if (failed.length === 0) {
        toast.success(demo ? "Demo mode — nothing was sent" : `${results.length} touches scheduled`);
        onClose();
        return;
      }
      // Keep only the failures so a retry doesn't send the successes twice.
      const failedIds = new Set(failed.map((f) => f.id));
      setTouches((cur) => cur.filter((t) => failedIds.has(t.id)));
      setSelectedId(failed[0].id);
      setError(
        `${results.length - failed.length} scheduled. Still to fix: ${failed
          .map((f) => {
            const t = touches.find((x) => x.id === f.id);
            return `${t ? `${dayLabel(t.date)} ${PLATFORM_LABEL[t.channel]}` : f.id} — ${f.error}`;
          })
          .join("; ")}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  // ---- left pane ----
  let left;
  if (step === 0) {
    left = (
      <div>
        <SectionLabel>Which event?</SectionLabel>
        <select
          aria-label="Which event"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          style={{ ...fieldStyle, height: 36, paddingInline: 8 }}
        >
          <option value="">{eventsLoading ? "Loading events…" : "Choose an upcoming event"}</option>
          {upcoming.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} — {dayLabel(toPacificDay(e.starts_at!))}
            </option>
          ))}
        </select>
        <div style={{ marginTop: 6 }}>
          <Hint>Need a new event? Create it under Events first, then come back.</Hint>
        </div>
        <div style={{ height: 20 }} />
        <SectionLabel>Channels</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CHANNELS.map((c) => (
            <ChipToggle key={c} label={PLATFORM_LABEL[c]} checked={channels.includes(c)} onChange={(on) => toggleChannel(c, on)} />
          ))}
        </div>
        <div style={{ height: 20 }} />
        <SectionLabel>How busy?</SectionLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {INTENSITIES.map((i) => (
            <ChoicePill key={i.value} label={i.label} selected={intensity === i.value} onSelect={() => setIntensity(i.value)} />
          ))}
        </div>
        <div style={{ height: 20 }} />
        <SectionLabel>Details</SectionLabel>
        <TextArea ariaLabel="Event details" value={context} onChange={setContext} rows={6} placeholder="Event details, links, tone…" />
        <div style={{ marginTop: 10 }}>
          <Checkbox label="Use as written" value={verbatim} onChange={setVerbatim} />
        </div>
        <ErrorText>{error}</ErrorText>
        <StepFooter
          onBack={onBackToPicker}
          nextLabel="Next: images"
          nextDisabled={!event || channels.length === 0 || !preview || preview.touches.length === 0 || (verbatim && !context.trim())}
          onNext={() => setStep(1)}
        />
      </div>
    );
  } else if (step === 1) {
    left = (
      <div>
        <div style={{ fontSize: 16, fontWeight: 510, marginBottom: 4 }}>Add the images we&apos;ll need</div>
        <Hint>Based on your channels. Add as many as you like per channel.</Hint>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {channels.map((c) => (
            <div key={c} style={{ padding: 12, borderRadius: 10, border: "var(--linear-border-width) solid var(--linear-color-hairline)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 510 }}>{PLATFORM_LABEL[c]}</span>
                <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
                  {c === "facebook" ? "1200×630 works best" : c === "instagram" ? "square or 4:5" : "header + body"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {images[c].map((img) => (
                  <div key={img.url}>
                    <OutreachImageSlot image={img} demo={demo} size={72} label={img.name} onChange={() => removeImage(c, img.url)} />
                    {c !== "email" && !validateImageDimensions(c, img.width, img.height).ok ? (
                      <div style={{ fontSize: 11, color: "#d97706", maxWidth: 80 }}>May be cropped</div>
                    ) : null}
                  </div>
                ))}
                <OutreachImageSlot image={null} demo={demo} size={72} label={`${PLATFORM_LABEL[c]} image`} onChange={(img) => addImage(c, img)} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <Checkbox label="Add each image to every channel" value={reuse} onChange={setReuse} />
        </div>
        <ErrorText>{error}</ErrorText>
        <StepFooter
          onBack={() => setStep(0)}
          nextLabel={library.length === 0 ? "Skip for now" : "Next: build plan"}
          busy={busy}
          onNext={() => void buildDrafts()}
        />
      </div>
    );
  } else {
    const groups = new Map<string, TouchDraft[]>();
    for (const t of touches) {
      const key = weekStart(t.date);
      groups.set(key, [...(groups.get(key) ?? []), t]);
    }
    const eventWeek = eventDay ? weekStart(eventDay) : null;
    left = (
      <div>
        {[...groups.entries()].map(([week, list]) => (
          <div key={week} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {week === eventWeek ? "Event week" : `Week of ${dayLabel(week)}`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((t) => (
                <RadioCard
                  key={t.id}
                  ariaLabel={`${dayLabel(t.date)} ${PLATFORM_LABEL[t.channel]} ${KIND_LABEL[t.kind]}`}
                  selected={selected?.id === t.id}
                  onSelect={() => setSelectedId(t.id)}
                >
                  <span style={{ width: 44, fontSize: 12, color: "var(--linear-color-ink-subtle)", flexShrink: 0 }}>{dayLabel(t.date)}</span>
                  <OutreachImageSlot
                    image={t.image}
                    demo={demo}
                    size={48}
                    label={`${PLATFORM_LABEL[t.channel]} image`}
                    onChange={(img) => patchTouch(t.id, { image: img })}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 510 }}>
                      {PLATFORM_LABEL[t.channel]} · {KIND_LABEL[t.kind]}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
                      {t.channel === "email" ? t.subject : t.text}
                    </div>
                  </div>
                </RadioCard>
              ))}
            </div>
          </div>
        ))}
        {touches.length === 0 ? <Hint>Nothing left to send.</Hint> : null}
        <ErrorText>{error}</ErrorText>
        <StepFooter
          onBack={() => setStep(1)}
          nextLabel={demo ? "Approve all" : "Approve all → schedule"}
          nextDisabled={touches.length === 0}
          busy={busy}
          onNext={() => void approveAll()}
        />
      </div>
    );
  }

  // ---- right pane ----
  let right;
  let rightLabel: React.ReactNode;
  if (step === 0) {
    rightLabel = preview ? `${preview.daysOut} days out → ~${preview.touches.length} touches` : undefined;
    right =
      preview && preview.touches.length > 0 ? (
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {preview.touches.map((t) => (
            <li key={t.id} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13 }}>
              <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px dashed var(--linear-color-ink-tertiary)" }} />
              <span style={{ width: 52, color: "var(--linear-color-ink-subtle)" }}>{dayLabel(t.date)}</span>
              <span>
                {PLATFORM_LABEL[t.channel]} · {KIND_LABEL[t.kind]}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <PreviewPlaceholder>{preview ? "That event is today or past, so there's nothing to schedule." : "Your schedule takes shape here"}</PreviewPlaceholder>
      );
  } else if (step === 1) {
    rightLabel = "Your image library for this event";
    right = (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {library.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.url} src={img.url} alt={img.name} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 8 }} />
          ))}
        </div>
        {library.length === 0 ? <PreviewPlaceholder>Images you add show up here</PreviewPlaceholder> : null}
        <div style={{ marginTop: 16 }}>
          <Hint>We&apos;ll match these to touches, and you can swap any in the next step.</Hint>
        </div>
      </div>
    );
  } else if (selected && selected.channel === "email") {
    rightLabel = (
      <span>
        {dayLabel(selected.date)} · {KIND_LABEL[selected.kind]} · To:{" "}
        <select
          aria-label="Audience"
          value={selected.audience}
          onChange={(e) => patchTouch(selected.id, { audience: e.target.value as EmailAudienceChoice })}
          style={{ font: "inherit", background: "transparent", color: "inherit", border: "none" }}
        >
          {AUDIENCES.map((a) => (
            <option key={a} value={a}>
              {AUDIENCE_LABEL[a]}
            </option>
          ))}
        </select>
      </span>
    );
    right = (
      <div key={selected.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextField ariaLabel="Subject" value={selected.subject ?? ""} onChange={(v) => patchTouch(selected.id, { subject: v })} placeholder="Subject" />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <OutreachImageSlot image={selected.image} demo={demo} size={72} label="header image" onChange={(img) => patchTouch(selected.id, { image: img })} />
          <Hint>Header image</Hint>
        </div>
        <div style={{ borderRadius: 8, border: "var(--linear-border-width) solid var(--linear-color-hairline)", background: "var(--linear-color-canvas)", overflow: "hidden" }}>
          <RichTextEditor content={selected.html ?? ""} onChange={(h) => patchTouch(selected.id, { html: h })} />
        </div>
      </div>
    );
  } else if (selected) {
    rightLabel = `${dayLabel(selected.date)} · ${PLATFORM_LABEL[selected.channel]}`;
    right = (
      <PlatformPreview
        platform={selected.channel as SocialPlatform}
        text={selected.text ?? ""}
        image={selected.image}
        dateLabel={dayLabel(selected.date)}
        menu={<PostMenu onEdit={() => setEditing(true)} onChangeImage={() => setChangingImage(true)} />}
      />
    );
  } else {
    right = <PreviewPlaceholder>Select a touch to preview it</PreviewPlaceholder>;
  }

  return (
    <>
      <OutreachShell
        steps={STEPS}
        step={step}
        onClose={onClose}
        onBack={step === 0 ? onBackToPicker : () => setStep((s) => s - 1)}
        rightLabel={rightLabel}
        left={left}
        right={right}
      />
      {selected && selected.channel !== "email" ? (
        <>
          <EditContentModal
            isOpen={editing}
            platform={selected.channel as SocialPlatform}
            text={selected.text ?? ""}
            onClose={() => setEditing(false)}
            onSave={(next) => patchTouch(selected.id, { text: next })}
          />
          <ChangeImageModal
            isOpen={changingImage}
            onClose={() => setChangingImage(false)}
            library={library}
            current={selected.image}
            demo={demo}
            onPick={(img) => patchTouch(selected.id, { image: img })}
          />
        </>
      ) : null}
    </>
  );
}

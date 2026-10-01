"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { validateImageDimensions, imageRequiredForService, formatPresetHints } from "@/lib/buffer/imageSpecs";
import { composeSocial, publishItems, type SocialCaptions } from "./api";
import { ChangeImageModal } from "./ChangeImageModal";
import { EditContentModal } from "./EditContentModal";
import { OutreachImageSlot } from "./OutreachImageSlot";
import { PlatformPreview } from "./OutreachPreviews";
import { PostMenu } from "./PostMenu";
import { OutreachShell, PreviewPlaceholder } from "./OutreachShell";
import {
  ChipToggle,
  ErrorText,
  Hint,
  RadioCard,
  SectionLabel,
  StepFooter,
  TextArea,
  WhenPicker,
  whenToChoice,
  type WhenValue,
} from "./ui";
import { PLATFORM_LABEL, type OutreachFlowProps, type SocialPlatform, type UploadedImage } from "./types";

const STEPS = ["Platforms", "Content", "Images", "Review"];
const PLATFORMS: SocialPlatform[] = ["facebook", "instagram"];

export function SocialPostFlow({ demo, onClose, onBackToPicker }: OutreachFlowProps) {
  const [step, setStep] = useState(1);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(["facebook", "instagram"]);
  const [context, setContext] = useState("");
  const [verbatim, setVerbatim] = useState(false);
  const [captions, setCaptions] = useState<SocialCaptions>({});
  const [images, setImages] = useState<Partial<Record<SocialPlatform, UploadedImage | null>>>({});
  const [reuse, setReuse] = useState(false);
  const [selected, setSelected] = useState<SocialPlatform>("facebook");
  const [when, setWhen] = useState<WhenValue>({ mode: "now", local: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [changingImage, setChangingImage] = useState(false);

  const library = [...new Map(Object.values(images).filter(Boolean).map((i) => [i!.url, i!])).values()];
  const activeSelected = platforms.includes(selected) ? selected : platforms[0];

  function togglePlatform(p: SocialPlatform, on: boolean) {
    setPlatforms((cur) => (on ? [...cur, p] : cur.filter((x) => x !== p)));
  }

  function setImage(p: SocialPlatform, img: UploadedImage | null) {
    setImages((cur) => {
      if (reuse && img) return Object.fromEntries(platforms.map((x) => [x, img]));
      return { ...cur, [p]: img };
    });
  }

  async function continueFromContent() {
    setBusy(true);
    setError(null);
    try {
      const result = await composeSocial({ context, verbatim, platforms }, demo);
      setCaptions(result);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not write the posts.");
    } finally {
      setBusy(false);
    }
  }

  function continueFromImages() {
    const missing = platforms.filter((p) => imageRequiredForService(p) && !images[p]);
    if (missing.length > 0) {
      setError("Instagram posts need an image.");
      return;
    }
    setError(null);
    setSelected(platforms[0]);
    setStep(3);
  }

  async function send() {
    const choice = whenToChoice(when);
    if (!choice) {
      setError("Pick a time in the future.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const results = await publishItems(
        platforms.map((p) => ({
          id: p,
          channel: p,
          when: choice,
          text: captions[p],
          imageUrl: images[p]?.url,
          imageWidth: images[p]?.width,
          imageHeight: images[p]?.height,
        })),
        demo,
      );
      const failed = results.filter((r) => !r.ok);
      if (failed.length === 0) {
        toast.success(demo ? "Demo mode — nothing was sent" : choice.mode === "now" ? "Posts scheduled to go out now" : "Posts scheduled");
        onClose();
      } else {
        setError(failed.map((f) => `${PLATFORM_LABEL[f.id as SocialPlatform]}: ${f.error}`).join(" "));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  // ---- left pane ----
  let left;
  if (step <= 1) {
    left = (
      <div>
        <SectionLabel>1 · Where should it go?</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PLATFORMS.map((p) => (
            <ChipToggle key={p} label={PLATFORM_LABEL[p]} checked={platforms.includes(p)} onChange={(on) => togglePlatform(p, on)} />
          ))}
        </div>
        <div style={{ marginTop: 6 }}>
          <Hint>Nextdoor isn&apos;t available through Buffer, so post there by hand.</Hint>
        </div>
        <div style={{ height: 24 }} />
        <SectionLabel>2 · What do you want to say?</SectionLabel>
        <TextArea
          ariaLabel="What do you want to say"
          value={context}
          onChange={setContext}
          rows={8}
          placeholder="Paste your final post, or drop notes, details, links — we'll write it in our voice."
        />
        <div style={{ marginTop: 10 }}>
          <Checkbox label="Post exactly as written" value={verbatim} onChange={setVerbatim} />
        </div>
        <ErrorText>{error}</ErrorText>
        <StepFooter
          onBack={onBackToPicker}
          nextLabel="Continue"
          nextDisabled={platforms.length === 0 || !context.trim()}
          busy={busy}
          onNext={() => void continueFromContent()}
        />
      </div>
    );
  } else if (step === 2) {
    left = (
      <div>
        <div style={{ fontSize: 16, fontWeight: 510, marginBottom: 4 }}>Add your images</div>
        <Hint>Instagram needs one; Facebook is optional.</Hint>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {platforms.map((p) => {
            const img = images[p];
            const fit = img ? validateImageDimensions(p, img.width, img.height) : null;
            return (
              <div
                key={p}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 10,
                  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                }}
              >
                <OutreachImageSlot image={img} demo={demo} label={`${PLATFORM_LABEL[p]} image`} onChange={(i) => setImage(p, i)} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 510 }}>{PLATFORM_LABEL[p]}</div>
                  <Hint>{formatPresetHints(p)}</Hint>
                  {fit && !fit.ok ? <div style={{ fontSize: 12, color: "#d97706", marginTop: 4 }}>{fit.message} It may be cropped.</div> : null}
                </div>
              </div>
            );
          })}
        </div>
        {platforms.length > 1 ? (
          <div style={{ marginTop: 12 }}>
            <Checkbox label="Use the same image for every platform" value={reuse} onChange={setReuse} />
          </div>
        ) : null}
        <ErrorText>{error}</ErrorText>
        <StepFooter onBack={() => setStep(1)} nextLabel="Continue" onNext={continueFromImages} />
      </div>
    );
  } else {
    left = (
      <div>
        <WhenPicker value={when} onChange={setWhen} />
        <div style={{ height: 24 }} />
        <SectionLabel>Review each platform</SectionLabel>
        <Hint>Select a row to preview it →</Hint>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          {platforms.map((p) => (
            <RadioCard key={p} ariaLabel={PLATFORM_LABEL[p]} selected={activeSelected === p} onSelect={() => setSelected(p)}>
              <OutreachImageSlot image={images[p]} demo={demo} size={56} label={`${PLATFORM_LABEL[p]} image`} onChange={(i) => setImage(p, i)} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 510 }}>{PLATFORM_LABEL[p]}</div>
                <div style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 340 }}>
                  {captions[p]}
                </div>
              </div>
            </RadioCard>
          ))}
        </div>
        <ErrorText>{error}</ErrorText>
        <StepFooter onBack={() => setStep(2)} nextLabel="Send to Buffer" busy={busy} onNext={() => void send()} />
      </div>
    );
  }

  // ---- right pane ----
  let right;
  if (step <= 1) {
    right = <PreviewPlaceholder>Previews appear here as you fill things in</PreviewPlaceholder>;
  } else if (step === 2) {
    right = (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {platforms.map((p) => (
          <PlatformPreview key={p} platform={p} text={captions[p] ?? ""} image={images[p]} dateLabel="Preview" />
        ))}
      </div>
    );
  } else {
    right = (
      <PlatformPreview
        platform={activeSelected}
        text={captions[activeSelected] ?? ""}
        image={images[activeSelected]}
        dateLabel={when.mode === "now" ? "Just now" : "Scheduled"}
        menu={<PostMenu onEdit={() => setEditing(true)} onChangeImage={() => setChangingImage(true)} />}
      />
    );
  }

  return (
    <>
      <OutreachShell
        steps={STEPS}
        step={step}
        onClose={onClose}
        onBack={step <= 1 ? onBackToPicker : () => setStep((s) => s - 1)}
        rightLabel={step === 3 ? `${PLATFORM_LABEL[activeSelected]} preview` : undefined}
        left={left}
        right={right}
      />
      <EditContentModal
        isOpen={editing}
        platform={activeSelected}
        text={captions[activeSelected] ?? ""}
        onClose={() => setEditing(false)}
        onSave={(next) => setCaptions((c) => ({ ...c, [activeSelected]: next }))}
      />
      <ChangeImageModal
        isOpen={changingImage}
        onClose={() => setChangingImage(false)}
        library={library}
        current={images[activeSelected]}
        demo={demo}
        onPick={(img) => setImage(activeSelected, img)}
      />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { RichTextEditor } from "@/components/patterns/client-templates-migrate/content/RichTextEditor";
import { composeEmail, publishItems, searchPeople } from "./api";
import { OutreachImageSlot } from "./OutreachImageSlot";
import { InboxPreview } from "./OutreachPreviews";
import { OutreachShell, PreviewPlaceholder } from "./OutreachShell";
import {
  ChoicePill,
  ErrorText,
  Hint,
  SectionLabel,
  StepFooter,
  TextArea,
  TextField,
  WhenPicker,
  whenToChoice,
  fieldStyle,
  type WhenValue,
} from "./ui";
import {
  AUDIENCE_LABEL,
  type EmailAudienceChoice,
  type OutreachFlowProps,
  type PersonHit,
  type UploadedImage,
} from "./types";

const STEPS = ["Audience", "Message", "Images", "Review"];
const AUDIENCES: EmailAudienceChoice[] = ["all", "donors", "volunteers"];

/** Prepends the header image to the email body (used for send). */
function withHeaderImage(html: string, image?: UploadedImage | null): string {
  return image ? `<p><img src="${image.url}" alt=""></p>\n${html}` : html;
}

export function EmailFlow({ demo, onClose, onBackToPicker }: OutreachFlowProps) {
  const [step, setStep] = useState(1);
  const [audience, setAudience] = useState<EmailAudienceChoice>("all");
  const [people, setPeople] = useState<PersonHit[]>([]);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PersonHit[]>([]);
  const [context, setContext] = useState("");
  const [verbatim, setVerbatim] = useState(false);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [composed, setComposed] = useState(false);
  const [headerImage, setHeaderImage] = useState<UploadedImage | null>(null);
  const [when, setWhen] = useState<WhenValue>({ mode: "now", local: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      searchPeople(q, demo)
        .then((r) => !cancelled && setHits(r.filter((h) => !people.some((p) => p.id === h.id))))
        .catch(() => !cancelled && setHits([]));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, demo, people]);

  const toLabel = people.length > 0 ? people.map((p) => p.fullName).join(", ") : AUDIENCE_LABEL[audience];

  async function continueFromMessage() {
    setBusy(true);
    setError(null);
    try {
      const out = await composeEmail({ context, verbatim }, demo);
      setSubject(out.subject);
      setHtml(out.html);
      setComposed(true);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not write the email.");
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    const choice = whenToChoice(when);
    if (!choice) {
      setError("Pick a time in the future.");
      return;
    }
    if (!subject.trim()) {
      setError("Add a subject line.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const [result] = await publishItems(
        [
          {
            id: "email",
            channel: "email",
            when: choice,
            subject: subject.trim(),
            html: withHeaderImage(html, headerImage),
            audience,
            recipientIds: people.length > 0 ? people.map((p) => p.id) : undefined,
          },
        ],
        demo,
      );
      if (result?.ok) {
        toast.success(
          demo ? "Demo mode — nothing was sent" : choice.mode === "now" ? "Email is on its way" : "Email scheduled",
        );
        onClose();
      } else {
        setError(result?.error ?? "Could not send.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  let left;
  if (step === 1) {
    left = (
      <div>
        <SectionLabel>To</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", opacity: people.length > 0 ? 0.5 : 1 }}>
          {AUDIENCES.map((a) => (
            <ChoicePill
              key={a}
              label={AUDIENCE_LABEL[a]}
              selected={audience === a && people.length === 0}
              onSelect={() => {
                setPeople([]);
                setAudience(a);
              }}
            />
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <input
            aria-label="Find people"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Or find people by name…"
            style={{ ...fieldStyle, height: 36, paddingInline: 10 }}
          />
          {hits.length > 0 ? (
            <div
              role="listbox"
              aria-label="Matching people"
              style={{
                marginTop: 4,
                borderRadius: 8,
                border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                overflow: "hidden",
              }}
            >
              {hits.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    setPeople((cur) => [...cur, h]);
                    setQuery("");
                    setHits([]);
                  }}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "block",
                    width: "calc(100% - 20px)",
                    padding: "8px 10px",
                    fontSize: 13,
                    background: "var(--linear-color-canvas)",
                  }}
                >
                  {h.fullName} <span style={{ color: "var(--linear-color-ink-subtle)" }}>{h.email}</span>
                </button>
              ))}
            </div>
          ) : null}
          {people.length > 0 ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {people.map((p) => (
                <span
                  key={p.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 28,
                    paddingInline: 10,
                    borderRadius: 14,
                    fontSize: 12,
                    background: "var(--linear-color-sidebar-item-selected)",
                    border: "var(--linear-border-width) solid var(--linear-color-accent)",
                  }}
                >
                  {p.fullName}
                  <button
                    type="button"
                    aria-label={`Remove ${p.fullName}`}
                    onClick={() => setPeople((cur) => cur.filter((x) => x.id !== p.id))}
                    style={{ all: "unset", cursor: "pointer", display: "inline-flex" }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          {people.length > 0 ? (
            <div style={{ marginTop: 6 }}>
              <Hint>Sent one-to-one to these people instead of a group (up to 50).</Hint>
            </div>
          ) : null}
        </div>
        <div style={{ height: 24 }} />
        <SectionLabel>Message</SectionLabel>
        <TextArea
          ariaLabel="Message"
          value={context}
          onChange={setContext}
          rows={8}
          placeholder="Write it yourself, or give us the gist and we'll draft the subject and body."
        />
        <div style={{ marginTop: 10 }}>
          <Checkbox label="Send exactly as written" value={verbatim} onChange={setVerbatim} />
        </div>
        <ErrorText>{error}</ErrorText>
        <StepFooter
          onBack={onBackToPicker}
          nextLabel="Continue"
          nextDisabled={!context.trim()}
          busy={busy}
          onNext={() => void continueFromMessage()}
        />
      </div>
    );
  } else if (step === 2) {
    left = (
      <div>
        <div style={{ fontSize: 16, fontWeight: 510, marginBottom: 4 }}>Header image</div>
        <Hint>Optional. It shows at the top of the email.</Hint>
        <div style={{ marginTop: 16 }}>
          <OutreachImageSlot image={headerImage} demo={demo} size={120} label="header image" onChange={setHeaderImage} />
        </div>
        <StepFooter
          onBack={() => setStep(1)}
          nextLabel={headerImage ? "Continue" : "Skip for now"}
          onNext={() => setStep(3)}
        />
      </div>
    );
  } else {
    left = (
      <div>
        <WhenPicker value={when} onChange={setWhen} />
        <div style={{ height: 20 }} />
        <SectionLabel>Summary</SectionLabel>
        <div style={{ fontSize: 13, lineHeight: "22px" }}>
          <div>
            <span style={{ color: "var(--linear-color-ink-subtle)" }}>To:</span> {toLabel}
          </div>
          <div>
            <span style={{ color: "var(--linear-color-ink-subtle)" }}>Subject:</span> {subject || "—"}
          </div>
        </div>
        <div style={{ marginTop: 6 }}>
          <Hint>Edit the subject and body on the right.</Hint>
        </div>
        <ErrorText>{error}</ErrorText>
        <StepFooter onBack={() => setStep(2)} nextLabel="Send email" busy={busy} onNext={() => void send()} />
      </div>
    );
  }

  let right;
  if (step === 3) {
    right = (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextField ariaLabel="Subject" value={subject} onChange={setSubject} placeholder="Subject" />
        <div
          style={{
            borderRadius: 8,
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            background: "var(--linear-color-canvas)",
            overflow: "hidden",
          }}
        >
          <RichTextEditor content={html} onChange={setHtml} />
        </div>
      </div>
    );
  } else if (composed) {
    right = <InboxPreview subject={subject} html={html} toLabel={toLabel} headerImage={headerImage} />;
  } else {
    right = <PreviewPlaceholder>Your email preview appears here once it&apos;s written</PreviewPlaceholder>;
  }

  return (
    <OutreachShell
      steps={STEPS}
      step={step}
      onClose={onClose}
      onBack={step === 1 ? onBackToPicker : () => setStep((s) => s - 1)}
      rightLabel={step === 3 ? `Editing email · To: ${toLabel}` : composed ? `Inbox view · ${toLabel}` : undefined}
      left={left}
      right={right}
    />
  );
}

"use client";

import { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import { getApiBase } from "@/lib/apiBase";
import { toast } from "sonner";

function MenuButton({
  onClick,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

export default function MarketingEmailComposer() {
  const [brief, setBrief] = useState("");
  const [sendNow, setSendNow] = useState(false);
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [subject, setSubject] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-600 underline dark:text-brand-400",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md",
        },
      }),
    ],
    content: "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] p-4 text-sm text-gray-800 dark:text-gray-100 focus:outline-none [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:max-w-full [&_img]:h-auto [&_a]:text-brand-600 [&_a]:underline dark:[&_a]:text-brand-400",
      },
    },
  });

  const insertImageFromFile = useCallback(async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch(
          `${getApiBase()}/api/marketing/email/upload-image`,
          { method: "POST", body: fd }
        );
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }
        if (!data.url) throw new Error("No image URL returned");
        editor.chain().focus().setImage({ src: data.url }).run();
        toast.success("Image inserted");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Image upload failed");
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://…)", prev ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  }, [editor]);

  const runDraft = async () => {
    const trimmed = brief.trim();
    if (!trimmed) {
      toast.error("Enter what you want to promote.");
      return;
    }
    let scheduledAtDescription: string;
    if (sendNow) {
      scheduledAtDescription = "Send as soon as the operator confirms.";
    } else if (scheduledLocal) {
      const d = new Date(scheduledLocal);
      if (Number.isNaN(d.getTime())) {
        toast.error("Pick a valid scheduled date and time.");
        return;
      }
      scheduledAtDescription = d.toISOString();
    } else {
      toast.error('Choose “Send immediately” or a scheduled date and time.');
      return;
    }

    setDrafting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/marketing/email/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          scheduledAt: scheduledAtDescription,
        }),
      });
      const data = (await res.json()) as {
        subject?: string;
        html?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Draft failed");
      }
      if (!data.subject || !data.html) {
        throw new Error("Invalid draft response");
      }
      setSubject(data.subject);
      editor?.commands.setContent(data.html);
      toast.success("Draft ready — review below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Draft failed");
    } finally {
      setDrafting(false);
    }
  };

  const runSend = async () => {
    if (!editor) return;
    const sub = subject.trim();
    const html = editor.getHTML();
    if (!sub) {
      toast.error("Subject is required.");
      return;
    }
    if (!html || html === "<p></p>") {
      toast.error("Email body is empty.");
      return;
    }
    if (!sendNow) {
      if (!scheduledLocal) {
        toast.error("Pick a scheduled time or enable “Send immediately”.");
        return;
      }
      const d = new Date(scheduledLocal);
      if (Number.isNaN(d.getTime())) {
        toast.error("Invalid scheduled time.");
        return;
      }
    }

    setSending(true);
    try {
      const res = await fetch(`${getApiBase()}/api/marketing/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: sub,
          html,
          sendNow,
          ...(sendNow ? {} : { scheduledAt: new Date(scheduledLocal).toISOString() }),
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Send failed");
      }
      toast.success(
        sendNow
          ? "Broadcast queued to send shortly."
          : `Broadcast scheduled (id: ${data.id ?? "created"}).`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  const canUseToolbar = !!editor;

  return (
    <div className="space-y-6">
      <ComponentCard
        title="1. Brief & schedule"
        desc="Describe what you’re promoting and when the broadcast should go out. Then generate a draft with Claude using your voice/tone guide."
      >
        <div className="space-y-4 px-6 pb-6">
          <div>
            <Label htmlFor="marketing-prompt">What to promote</Label>
            <textarea
              id="marketing-prompt"
              rows={5}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="e.g. Remind neighbors about the spring cleanup day, link to signup, deadline next Friday…"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={sendNow}
                onChange={(e) => setSendNow(e.target.checked)}
                className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
              />
              Send immediately when I press Send
            </label>
          </div>
          {!sendNow && (
            <div className="max-w-md">
              <Label htmlFor="marketing-when">Scheduled send (local time)</Label>
              <input
                id="marketing-when"
                type="datetime-local"
                value={scheduledLocal}
                onChange={(e) => setScheduledLocal(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => void runDraft()}
            disabled={drafting}
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-mercury-on-accent hover:bg-brand-600 hover:text-white disabled:opacity-50"
          >
            {drafting ? "Generating…" : "Generate draft"}
          </button>
        </div>
      </ComponentCard>

      <ComponentCard
        title="2. Review & edit"
        desc="Edit the subject and body. Keep the unsubscribe merge tag. Use the toolbar for formatting; images upload to your Webflow site assets (HTTPS URL)."
      >
        <div className="space-y-4 px-6 pb-6">
          <div>
            <Label htmlFor="marketing-subject">Subject</Label>
            <input
              id="marketing-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          {canUseToolbar && (
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">
              <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")}
              >
                Bold
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")}
              >
                Italic
              </MenuButton>
              <MenuButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                active={editor.isActive("heading", { level: 2 })}
              >
                H2
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive("bulletList")}
              >
                List
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive("orderedList")}
              >
                Numbered
              </MenuButton>
              <MenuButton onClick={setLink} active={editor.isActive("link")}>
                Link
              </MenuButton>
              <MenuButton onClick={() => void insertImageFromFile()}>
                Image
              </MenuButton>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            {editor ? (
              <EditorContent editor={editor} />
            ) : (
              <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                Loading editor…
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void runSend()}
            disabled={sending}
            className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            {sending ? "Sending…" : "Send broadcast"}
          </button>
        </div>
      </ComponentCard>
    </div>
  );
}

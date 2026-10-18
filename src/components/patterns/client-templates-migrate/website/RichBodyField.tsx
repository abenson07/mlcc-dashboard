"use client";

import { useRef, useState } from "react";
import {
  defineAnnotation,
  defineBlockObject,
  defineDecorator,
  defineSchema,
  defineTextBlock,
  EditorProvider,
  PortableTextEditable,
  useEditor,
  useEditorSelector,
  type PortableTextBlock,
} from "@portabletext/editor";
import { EventListenerPlugin, NodePlugin } from "@portabletext/editor/plugins";
import { isActiveAnnotation, isActiveDecorator, isActiveListItem, isActiveStyle } from "@portabletext/editor/selectors";
import { toast } from "sonner";
import { sanityImageUrl, websiteApi } from "./api";

/** Mirrors sanity/schemas/body.ts, the shape the site renders. */
const schemaDefinition = defineSchema({
  decorators: [{ name: "strong" }, { name: "em" }],
  styles: [{ name: "normal" }, { name: "h3" }, { name: "h4" }],
  lists: [{ name: "bullet" }],
  annotations: [{ name: "link", fields: [{ name: "href", type: "string" }] }],
  blockObjects: [
    { name: "image", fields: [{ name: "asset", type: "object" }, { name: "alt", type: "string" }, { name: "caption", type: "string" }] },
    { name: "youtube", fields: [{ name: "youtubeId", type: "string" }, { name: "title", type: "string" }] },
  ],
});

const textBlock = defineTextBlock({
  type: "block",
  render: (props) => {
    const { style, listItem } = props.node;
    if (listItem === "bullet") {
      return <div {...props.attributes} style={{ display: "list-item", listStyleType: "disc", marginLeft: 20, margin: "0 0 4px 20px" }}>{props.children}</div>;
    }
    if (style === "h3") return <div {...props.attributes} style={{ fontSize: 17, fontWeight: 700, margin: "12px 0 4px" }}>{props.children}</div>;
    if (style === "h4") return <div {...props.attributes} style={{ fontSize: 14, fontWeight: 700, margin: "10px 0 4px" }}>{props.children}</div>;
    return <div {...props.attributes} style={{ margin: "0 0 8px" }}>{props.children}</div>;
  },
});

const nodes = [
  textBlock,
  defineDecorator({ type: "strong", render: ({ children }) => <strong>{children}</strong> }),
  defineDecorator({ type: "em", render: ({ children }) => <em>{children}</em> }),
  defineAnnotation({ type: "link", render: ({ children }) => <span style={{ textDecoration: "underline", color: "#5e6ad2" }}>{children}</span> }),
  defineBlockObject({
    type: "image",
    render: ({ attributes, children, node }) => {
      const img = node as { asset?: { _ref?: string }; alt?: string };
      return (
        <div {...attributes} style={{ margin: "8px 0" }}>
          {children}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sanityImageUrl(img.asset?._ref, 600)} alt={img.alt ?? ""} style={{ maxWidth: "100%", borderRadius: 8, display: "block" }} />
          {!img.alt && <div style={{ fontSize: 11, opacity: 0.6 }}>No alt text</div>}
        </div>
      );
    },
  }),
  defineBlockObject({
    type: "youtube",
    render: ({ attributes, children, node }) => {
      const v = node as { youtubeId?: string; title?: string };
      return (
        <div {...attributes} style={{ margin: "8px 0", padding: 10, border: "1px dashed var(--linear-color-hairline)", borderRadius: 8, fontSize: 12 }}>
          {children}
          ▶ YouTube: {v.title || v.youtubeId}
        </div>
      );
    },
  }),
];

const btn = (active: boolean): React.CSSProperties => ({
  all: "unset",
  boxSizing: "border-box",
  cursor: "pointer",
  minWidth: 26,
  height: 26,
  padding: "0 6px",
  textAlign: "center",
  borderRadius: 5,
  fontSize: 12,
  lineHeight: "26px",
  fontWeight: 600,
  background: active ? "var(--linear-color-hairline)" : "transparent",
  color: "var(--linear-color-ink)",
});

function youtubeIdFrom(input: string): string | null {
  const m = input.trim().match(/(?:youtu\.be\/|v=|embed\/|live\/)([A-Za-z0-9_-]{11})/) ?? input.trim().match(/^([A-Za-z0-9_-]{11})$/);
  return m?.[1] ?? null;
}

function Toolbar() {
  const editor = useEditor();
  const fileRef = useRef<HTMLInputElement>(null);
  const bold = useEditorSelector(editor, isActiveDecorator("strong"));
  const italic = useEditorSelector(editor, isActiveDecorator("em"));
  const h3 = useEditorSelector(editor, isActiveStyle("h3"));
  const h4 = useEditorSelector(editor, isActiveStyle("h4"));
  const bullet = useEditorSelector(editor, isActiveListItem("bullet"));
  const link = useEditorSelector(editor, isActiveAnnotation("link"));

  const run = (event: Parameters<typeof editor.send>[0]) => {
    editor.send(event);
    editor.send({ type: "focus" });
  };

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const image = await websiteApi.upload(file);
      const alt = window.prompt("Describe this image for screen readers (alt text):") ?? "";
      run({ type: "insert.block object", placement: "auto", blockObject: { name: "image", value: { asset: image.asset, alt } } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: 4, borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)" }}>
      <button type="button" style={btn(bold)} onMouseDown={(e) => e.preventDefault()} onClick={() => run({ type: "decorator.toggle", decorator: "strong" })} title="Bold">B</button>
      <button type="button" style={{ ...btn(italic), fontStyle: "italic" }} onMouseDown={(e) => e.preventDefault()} onClick={() => run({ type: "decorator.toggle", decorator: "em" })} title="Italic">I</button>
      <button type="button" style={btn(h3)} onMouseDown={(e) => e.preventDefault()} onClick={() => run({ type: "style.toggle", style: "h3" })} title="Heading">H</button>
      <button type="button" style={btn(h4)} onMouseDown={(e) => e.preventDefault()} onClick={() => run({ type: "style.toggle", style: "h4" })} title="Subheading">h</button>
      <button type="button" style={btn(bullet)} onMouseDown={(e) => e.preventDefault()} onClick={() => run({ type: "list item.toggle", listItem: "bullet" })} title="Bulleted list">•</button>
      <button
        type="button"
        style={btn(link)}
        onMouseDown={(e) => e.preventDefault()}
        title="Link"
        onClick={() => {
          if (link) return run({ type: "annotation.toggle", annotation: { name: "link", value: { href: "" } } });
          const href = window.prompt("Link to (https://…)");
          if (href && /^(https?:\/\/|mailto:|\/)/i.test(href.trim())) run({ type: "annotation.add", annotation: { name: "link", value: { href: href.trim() } } });
          else if (href) toast.error("Links must start with https://, mailto: or /");
        }}
      >
        Link
      </button>
      <button type="button" style={btn(false)} onMouseDown={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()} title="Insert image">Image</button>
      <button
        type="button"
        style={btn(false)}
        onMouseDown={(e) => e.preventDefault()}
        title="Insert YouTube video"
        onClick={() => {
          const raw = window.prompt("YouTube link or ID");
          if (!raw) return;
          const youtubeId = youtubeIdFrom(raw);
          if (!youtubeId) return void toast.error("That doesn't look like a YouTube link");
          const title = window.prompt("Video title (for screen readers)") ?? "Video";
          run({ type: "insert.block object", placement: "auto", blockObject: { name: "youtube", value: { youtubeId, title } } });
        }}
      >
        Video
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

export function RichBodyField({ value, onChange, readOnly }: { value: unknown; onChange: (next: PortableTextBlock[]) => void; readOnly?: boolean }) {
  // Remount-safe initial value; the editor owns the content after this.
  const [initialValue] = useState(() => (Array.isArray(value) ? (value as PortableTextBlock[]) : undefined));
  return (
    <div style={{ border: "var(--linear-border-width) solid var(--linear-color-hairline)", borderRadius: 6, background: "var(--linear-color-canvas)", opacity: readOnly ? 0.6 : 1 }}>
      <EditorProvider initialConfig={{ schemaDefinition, initialValue }}>
        <EventListenerPlugin
          on={(event) => {
            if (event.type === "mutation" && !readOnly) onChange((event.value ?? []) as PortableTextBlock[]);
          }}
        />
        {!readOnly && <Toolbar />}
        <NodePlugin nodes={nodes} />
        <PortableTextEditable readOnly={readOnly} style={{ padding: "8px 10px", minHeight: 160, fontSize: 13, lineHeight: 1.5, outline: "none", color: "var(--linear-color-ink)" }} />
      </EditorProvider>
    </div>
  );
}

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { IconButton } from "@/components/patterns/shared/IconButton";

export type RichTextEditorProps = {
  label: string;
  content: string;
  onChange: (html: string) => void;
};

export function RichTextEditor({ label, content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: content || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        style: "min-height: 160px; outline: none; font-size: 13px; line-height: 20px;",
      },
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span>
      <div
        style={{
          boxSizing: "border-box",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          borderRadius: 6,
          background: "var(--linear-color-canvas)",
          color: "var(--linear-color-ink)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 2,
            padding: 4,
            borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
          }}
        >
          <IconButton
            label="Bold"
            variant="ghost"
            size="sm"
            icon={<Bold size={14} strokeWidth={1.75} />}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <IconButton
            label="Italic"
            variant="ghost"
            size="sm"
            icon={<Italic size={14} strokeWidth={1.75} />}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <IconButton
            label="Bullet list"
            variant="ghost"
            size="sm"
            icon={<List size={14} strokeWidth={1.75} />}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <IconButton
            label="Numbered list"
            variant="ghost"
            size="sm"
            icon={<ListOrdered size={14} strokeWidth={1.75} />}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
        </div>
        <div style={{ padding: 8 }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { toast } from "sonner";

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "lf-small-btn lf-small-btn--active" : "lf-small-btn"}
    >
      {children}
    </button>
  );
}

function BubbleButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "lf-story-bubble-btn lf-story-bubble-btn--active" : "lf-story-bubble-btn"}
    >
      {children}
    </button>
  );
}

type StoryBodyEditorProps = {
  content: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
};

export default function StoryBodyEditor({ content, onChange, onUploadImage }: StoryBodyEditorProps) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "lf-story-link" } }),
      Image.configure({ HTMLAttributes: { class: "lf-story-image" } }),
    ],
    content: content || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onChangeRef.current(ed.getHTML());
      }, 800);
    },
    editorProps: {
      attributes: { class: "lf-story-editor-body" },
    },
  });

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const insertImageFromFile = useCallback(async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await onUploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Image upload failed");
      }
    };
    input.click();
  }, [editor, onUploadImage]);

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

  if (!editor) {
    return <p className="lf-meta">Loading editor…</p>;
  }

  return (
    <div className="lf-story-editor">
      <div className="lf-story-editor-toolbar">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          Bold
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          Italic
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          H3
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          Numbered
        </ToolbarButton>
        <ToolbarButton onClick={setLink} active={editor.isActive("link")}>
          Link
        </ToolbarButton>
        <ToolbarButton onClick={() => void insertImageFromFile()}>Image</ToolbarButton>
      </div>

      <BubbleMenu editor={editor} className="lf-story-bubble-menu" shouldShow={({ state }) => !state.selection.empty}>
        <BubbleButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          B
        </BubbleButton>
        <BubbleButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          I
        </BubbleButton>
        <BubbleButton onClick={setLink} active={editor.isActive("link")}>
          Link
        </BubbleButton>
      </BubbleMenu>

      <FloatingMenu editor={editor} className="lf-story-floating-menu">
        <button
          type="button"
          className="lf-story-floating-add"
          aria-label="Insert image"
          onClick={() => void insertImageFromFile()}
        >
          +
        </button>
      </FloatingMenu>

      <EditorContent editor={editor} />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { usePeople } from "hooks";

type MentionListProps = {
  items: { id: string; label: string }[];
  command: (item: { id: string; label: string }) => void;
};

function MentionList({ items, command }: MentionListProps) {
  if (items.length === 0) {
    return (
      <div className="lf-mention-dropdown">
        <span className="lf-meta">No people found</span>
      </div>
    );
  }

  return (
    <div className="lf-mention-dropdown" role="listbox">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="option"
          className="lf-mention-item"
          onClick={() => command(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

type AgendaEditorProps = {
  content: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
  disabled?: boolean;
};

export default function AgendaEditor({ content, onChange, disabled = false }: AgendaEditorProps) {
  const { people } = usePeople({ autoFetch: true });
  const peopleRef = useRef(people);
  peopleRef.current = people;

  const suggestion = useMemo(
    () => ({
      items: ({ query }: { query: string }) => {
        const q = query.toLowerCase();
        return peopleRef.current
          .filter((p) => p.full_name.toLowerCase().includes(q))
          .slice(0, 8)
          .map((p) => ({ id: p.id, label: p.full_name }));
      },
      render: () => {
        let component: ReactRenderer | null = null;
        let popup: TippyInstance | null = null;

        return {
          onStart: (props: {
            clientRect?: (() => DOMRect | null) | null;
            items: { id: string; label: string }[];
            command: (item: { id: string; label: string }) => void;
          }) => {
            component = new ReactRenderer(MentionList, { props, editor: props as never });

            if (!props.clientRect) return;

            popup = tippy(document.body, {
              getReferenceClientRect: props.clientRect as () => DOMRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
            });
          },
          onUpdate(props: {
            clientRect?: (() => DOMRect | null) | null;
            items: { id: string; label: string }[];
            command: (item: { id: string; label: string }) => void;
          }) {
            component?.updateProps(props);
            if (!props.clientRect || !popup) return;
            popup.setProps({
              getReferenceClientRect: props.clientRect as () => DOMRect,
            });
          },
          onKeyDown(props: { event: KeyboardEvent }) {
            if (props.event.key === "Escape") {
              popup?.hide();
              return true;
            }
            return false;
          },
          onExit() {
            popup?.destroy();
            component?.destroy();
          },
        };
      },
    }),
    [],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Mention.configure({
        HTMLAttributes: { class: "lf-mention" },
        suggestion,
      }),
    ],
    content: content ?? { type: "doc", content: [{ type: "paragraph" }] },
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: "lf-agenda-editor-body",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return <p className="lf-meta">Loading editor…</p>;

  return (
    <div className={`lf-agenda-editor${disabled ? " lf-agenda-editor--disabled" : ""}`}>
      <p className="lf-meta" style={{ marginBottom: 8 }}>
        Type <strong>@</strong> to mention someone from the people list.
      </p>
      <EditorContent editor={editor} />
    </div>
  );
}

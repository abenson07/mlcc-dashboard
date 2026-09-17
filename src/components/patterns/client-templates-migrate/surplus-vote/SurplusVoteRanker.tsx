"use client";

import { useMemo } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import type { SurplusVoteItem } from "@/lib/surplus-vote/items";
import { formatSurplusPrice, SURPLUS_VOTE_ITEM_COUNT } from "@/lib/surplus-vote/items";

type SurplusVoteRankerProps = {
  items: SurplusVoteItem[];
  onReorder: (next: SurplusVoteItem[]) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
  hasSaved: boolean;
};

function SortableCard({ item, rank }: { item: SurplusVoteItem; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        listStyle: "none",
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        opacity: isDragging ? 0.92 : 1,
      }}
    >
      <div
        {...attributes}
        {...listeners}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "12px 14px",
          background: "var(--linear-color-panel)",
          border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
          borderRadius: "var(--linear-radius-md)",
          boxShadow: isDragging
            ? "var(--linear-shadow-panel)"
            : "none",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: 8,
            background: "var(--linear-color-sidebar-item-selected)",
            color: "var(--linear-color-ink)",
            fontSize: 13,
            fontWeight: 600,
            lineHeight: "20px",
          }}
        >
          {rank}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Text weight="medium">{item.title}</Text>
            {item.priceDollars != null ? (
              <Text size="sm" weight="medium" style={{ flexShrink: 0 }}>
                {formatSurplusPrice(item.priceDollars)}
              </Text>
            ) : null}
          </div>
          <Text size="sm" color="secondary">
            {item.description}
          </Text>
        </div>
        <GripVertical
          size={16}
          strokeWidth={1.75}
          aria-hidden
          style={{
            marginTop: 6,
            flexShrink: 0,
            color: "var(--linear-color-ink-tertiary)",
          }}
        />
      </div>
    </li>
  );
}

export function SurplusVoteRanker({
  items,
  onReorder,
  onSave,
  saving,
  dirty,
  hasSaved,
}: SurplusVoteRankerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = useMemo(() => items.map((item) => item.id), [items]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 680,
        marginInline: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
          <Text weight="semibold">Rank surplus spending</Text>
          <Text size="sm" color="secondary">
            Drag the cards so your top priority is first. First of {SURPLUS_VOTE_ITEM_COUNT}{" "}
            gets {SURPLUS_VOTE_ITEM_COUNT} points; last gets 1. You can change this later.
          </Text>
        </div>
        <Button
          label={saving ? "Saving…" : hasSaved && !dirty ? "Saved" : "Save ranking"}
          variant="primary"
          disabled={saving || (!dirty && hasSaved)}
          onClick={onSave}
        />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ol
            aria-label="Surplus spending priorities"
            style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0 }}
          >
            {items.map((item, index) => (
              <SortableCard key={item.id} item={item} rank={index + 1} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </section>
  );
}

export type PopoverRect = { left: number; right: number; top: number; bottom: number; width: number };

export type PopoverPlacement = "below" | "above";
export type PopoverAlignment = "start" | "end" | "center";

/**
 * Where to put a fixed-position popover surface so it stays on screen:
 * flips to the other side of the trigger when it doesn't fit (and the other
 * side has more room), and is clamped inside the viewport horizontally.
 */
export function computePopoverPosition(params: {
  trigger: PopoverRect;
  surface: { width: number; height: number };
  viewport: { width: number; height: number };
  placement: PopoverPlacement;
  alignment: PopoverAlignment;
  gap?: number;
  edge?: number;
}): { top: number; left: number; placement: PopoverPlacement } {
  const { trigger: t, surface: s, viewport: v, alignment } = params;
  const gap = params.gap ?? 4;
  const edge = params.edge ?? 8;

  const spaceBelow = v.height - t.bottom - gap - edge;
  const spaceAbove = t.top - gap - edge;
  let placement = params.placement;
  if (placement === "below" && s.height > spaceBelow && spaceAbove > spaceBelow) placement = "above";
  else if (placement === "above" && s.height > spaceAbove && spaceBelow > spaceAbove) placement = "below";

  const top = placement === "below" ? t.bottom + gap : t.top - gap - s.height;

  let left =
    alignment === "end" ? t.right - s.width : alignment === "center" ? t.left + t.width / 2 - s.width / 2 : t.left;
  left = Math.max(edge, Math.min(left, v.width - s.width - edge));

  return { top: Math.max(edge, top), left, placement };
}

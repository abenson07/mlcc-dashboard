"use client";

import type { ReactNode } from "react";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";

export type SideContentSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

/**
 * Labeled group of side-rail fields — Astryx `List` with a section header.
 */
export function SideContentSection({
  title,
  action,
  children,
}: SideContentSectionProps) {
  return (
    <List
      density="compact"
      header={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Text type="label" color="secondary">
            {title}
          </Text>
          {action}
        </div>
      }
    >
      {children}
    </List>
  );
}

import type { ComponentType } from "react";

export type NavIcon = ComponentType<{
  className?: string;
  size?: number;
  strokeWidth?: number;
}>;

export type NavLevel = "l1" | "l2";

export type NavHeaderVariant = "workspace" | "search";

export type DropdownItem =
  | { type: "item"; id: string; label: string; href?: string }
  | { type: "divider" };

export type NavItemConfig = {
  id: string;
  label: string;
  icon: NavIcon;
  href?: string;
  badge?: string;
  active?: boolean;
  /** Placeholder nav item — label renders italicized */
  notReady?: boolean;
  /** Optional affordance icon (e.g. swap on leaflet overview) */
  affordanceIcon?: NavIcon;
  /** Shows a remove (x) button on the row, e.g. to unfavorite */
  onRemove?: () => void;
};

export type NavGroupConfig = {
  id: string;
  header?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  items: NavItemConfig[];
};

export type NavContextConfig = {
  dropdownId: string;
  label: string;
  icon: NavIcon;
  dropdownItems: DropdownItem[];
  /** First item id in dropdownItems that represents the current selection */
  activeDropdownItemId?: string;
};

export type WorkspaceConfig = {
  dropdownId: string;
  avatar: string;
  username: string;
  dropdownItems: DropdownItem[];
  activeDropdownItemId?: string;
};

export type NavBackConfig = {
  label: string;
  href: string;
};

export type NavPanelConfig = {
  level: NavLevel;
  ariaLabel: string;
  header?: NavHeaderVariant;
  back?: NavBackConfig;
  workspace?: WorkspaceConfig;
  context?: NavContextConfig;
  groups: NavGroupConfig[];
  footer?: NavItemConfig[];
};

export type NavVariant =
  | "l1"
  | "l1-dropdown"
  | "settings"
  | "event"
  | "event-dropdown"
  | "leaflet"
  | "leaflet-dropdown";

export type ResolvedVariant = {
  config: NavPanelConfig;
  openDropdownId: string | null;
};

"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CreditCard,
  FileStack,
  FileText,
  GraduationCap,
  HelpCircle,
  Inbox,
  ListChecks,
  MessageSquare,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Users,
  Users2,
} from "lucide-react";
import {
  Dropdown,
  DropdownItem,
} from "@/components/patterns/shared/dropdown";
import {
  MenuItem,
  NavBottom,
  SidebarHeader,
  SidebarHeaderActions,
  SidebarIconButton,
  SidebarScrollArea,
  SidebarSection,
  TryButton,
  WorkspaceMenu,
} from "./sidebar";
import { useThemeMode } from "./ThemeContext";
import "./sidebar/sidebar.css";

type DemoItem = {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  /** Green dot when a real page has been designed; red when it's still a placeholder. */
  hasContent: boolean;
};

const group1Items: DemoItem[] = [
  {
    id: "action-items",
    label: "Action Items",
    icon: <ListChecks size={16} strokeWidth={1.75} />,
    href: "/admin-preview/action-items",
    hasContent: true,
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: <Inbox size={16} strokeWidth={1.75} />,
    href: "/admin-preview/inbox",
    hasContent: false,
  },
  {
    id: "comms",
    label: "Comms",
    icon: <MessageSquare size={16} strokeWidth={1.75} />,
    href: "/admin-preview/comms",
    hasContent: false,
  },
];

const group2Items: DemoItem[] = [
  {
    id: "events",
    label: "Events",
    icon: <CalendarDays size={16} strokeWidth={1.75} />,
    href: "/admin-preview/events",
    hasContent: false,
  },
  {
    id: "committees",
    label: "Committees",
    icon: <Users2 size={16} strokeWidth={1.75} />,
    href: "/admin-preview/committees",
    hasContent: true,
  },
  {
    id: "leaflets",
    label: "Leaflets",
    icon: <FileText size={16} strokeWidth={1.75} />,
    href: "/admin-preview/leaflets",
    hasContent: false,
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: <CreditCard size={16} strokeWidth={1.75} />,
    href: "/admin-preview/invoices",
    hasContent: true,
  },
];

const databaseItems: DemoItem[] = [
  {
    id: "people",
    label: "People",
    icon: <Users size={16} strokeWidth={1.75} />,
    href: "/admin-preview/people",
    hasContent: true,
  },
  {
    id: "businesses",
    label: "Businesses",
    icon: <Building2 size={16} strokeWidth={1.75} />,
    href: "/admin-preview/businesses",
    hasContent: true,
  },
  {
    id: "content",
    label: "Content",
    icon: <FileStack size={16} strokeWidth={1.75} />,
    href: "/admin-preview/content",
    hasContent: false,
  },
];

const favoriteItems: DemoItem[] = [
  {
    id: "fav-volunteers",
    label: "Volunteers",
    icon: <Users size={16} strokeWidth={1.75} />,
    href: "/admin-preview/people?view=volunteers",
    hasContent: true,
  },
  {
    id: "fav-summer-social",
    label: "Summer Social Overview",
    icon: <CalendarDays size={16} strokeWidth={1.75} />,
    href: "/admin-preview/events",
    hasContent: false,
  },
];

function ContentStatusDot({ hasContent }: { hasContent: boolean }) {
  return (
    <span
      role="img"
      aria-label={hasContent ? "Content designed" : "Content not yet designed"}
      title={hasContent ? "Content designed" : "Content not yet designed"}
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: hasContent ? "#27a644" : "#eb5757",
        flexShrink: 0,
      }}
    />
  );
}

function KyleBrowerAvatar() {
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        background: "#5e6ad2",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#ffffff",
        fontSize: 9,
        fontWeight: 600,
      }}
    >
      KB
    </span>
  );
}

export type LinearSidebarProps = {
  onSettingsClick?: () => void;
};

/**
 * Linear-style sidebar composed from named sidebar primitives.
 */
export function LinearSidebar({ onSettingsClick }: LinearSidebarProps = {}) {
  const { mode, toggle } = useThemeMode();
  const pathname = usePathname();
  const router = useRouter();

  function isSelected(href: string): boolean {
    return pathname === href.split("?")[0];
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: "8px 8px 10px",
        boxSizing: "border-box",
      }}
    >
      <SidebarHeader>
        <WorkspaceMenu name="Kyle Brower" icon={<KyleBrowerAvatar />}>
          <DropdownItem
            label="Settings"
            icon={<Settings size={16} strokeWidth={1.75} />}
            onSelect={onSettingsClick}
          />
          <DropdownItem
            label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            icon={
              mode === "dark" ? (
                <Sun size={16} strokeWidth={1.75} />
              ) : (
                <Moon size={16} strokeWidth={1.75} />
              )
            }
            onSelect={toggle}
          />
        </WorkspaceMenu>
        <SidebarHeaderActions>
          <SidebarIconButton
            label="Search"
            variant="ghost"
            icon={<Search size={16} strokeWidth={1.75} />}
          />
          <Dropdown
            label="Create"
            placement="below"
            alignment="end"
            trigger={
              <SidebarIconButton
                label="Create new issue"
                variant="primary"
                icon={<Plus size={16} strokeWidth={1.75} />}
              />
            }
          >
            <DropdownItem
              label="New Class"
              icon={<GraduationCap size={16} strokeWidth={1.75} />}
            />
            <DropdownItem
              label="New Student"
              icon={<Users size={16} strokeWidth={1.75} />}
            />
            <DropdownItem
              label="New Invoice"
              icon={<CreditCard size={16} strokeWidth={1.75} />}
            />
          </Dropdown>
        </SidebarHeaderActions>
      </SidebarHeader>

      <SidebarScrollArea>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {group1Items.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={isSelected(item.href)}
              onClick={() => router.push(item.href)}
              indicator={<ContentStatusDot hasContent={item.hasContent} />}
            />
          ))}
        </div>

        <SidebarSection title="Manage">
          {group2Items.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={isSelected(item.href)}
              onClick={() => router.push(item.href)}
              indicator={<ContentStatusDot hasContent={item.hasContent} />}
            />
          ))}
        </SidebarSection>

        <SidebarSection title="Database">
          {databaseItems.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={isSelected(item.href)}
              onClick={() => router.push(item.href)}
              indicator={<ContentStatusDot hasContent={item.hasContent} />}
            />
          ))}
        </SidebarSection>

        <SidebarSection title="Favorites">
          {favoriteItems.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={isSelected(item.href)}
              onClick={() => router.push(item.href)}
              indicator={<ContentStatusDot hasContent={item.hasContent} />}
            />
          ))}
        </SidebarSection>
      </SidebarScrollArea>

      <NavBottom
        start={<TryButton />}
        end={
          <SidebarIconButton
            label="Help"
            variant="ghost"
            icon={<HelpCircle size={16} strokeWidth={1.75} />}
          />
        }
      />
    </div>
  );
}

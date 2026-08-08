"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CreditCard,
  FileStack,
  FileText,
  HelpCircle,
  Inbox,
  ListChecks,
  Mail,
  Megaphone,
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
import { useEvents, useStories } from "hooks";
import { getCurrentPersonId } from "@/lib/people/currentPerson";
import { AddPromotionModal, NewEventModal } from "@/components/patterns/client-templates/events";
import { NewStoryModal } from "@/components/patterns/client-templates/content";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import type { EventPromotionType, EventSummary } from "@/data/mocks/events";
import type { Story } from "@/data/mocks/content";
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
  /** Path relative to the active base (`/admin-preview` or `/admin-migrate`) — prefixed at render time. */
  path: string;
  /** Green dot when a real page has been designed; red when it's still a placeholder. */
  hasContent: boolean;
};

const group1Items: DemoItem[] = [
  {
    id: "action-items",
    label: "Action Items",
    icon: <ListChecks size={16} strokeWidth={1.75} />,
    path: "/action-items",
    hasContent: true,
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: <Inbox size={16} strokeWidth={1.75} />,
    path: "/inbox",
    hasContent: false,
  },
];

const group2Items: DemoItem[] = [
  {
    id: "events",
    label: "Events",
    icon: <CalendarDays size={16} strokeWidth={1.75} />,
    path: "/events",
    hasContent: true,
  },
  {
    id: "committees",
    label: "Committees",
    icon: <Users2 size={16} strokeWidth={1.75} />,
    path: "/committees",
    hasContent: true,
  },
  {
    id: "leaflets",
    label: "Leaflets",
    icon: <FileText size={16} strokeWidth={1.75} />,
    path: "/leaflets",
    hasContent: true,
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: <CreditCard size={16} strokeWidth={1.75} />,
    path: "/invoices",
    hasContent: true,
  },
];

const databaseItems: DemoItem[] = [
  {
    id: "people",
    label: "People",
    icon: <Users size={16} strokeWidth={1.75} />,
    path: "/people",
    hasContent: true,
  },
  {
    id: "businesses",
    label: "Businesses",
    icon: <Building2 size={16} strokeWidth={1.75} />,
    path: "/businesses",
    hasContent: true,
  },
  {
    id: "content",
    label: "Content",
    icon: <FileStack size={16} strokeWidth={1.75} />,
    path: "/content",
    hasContent: false,
  },
];

const favoriteItems: DemoItem[] = [
  {
    id: "fav-volunteers",
    label: "Volunteers",
    icon: <Users size={16} strokeWidth={1.75} />,
    path: "/people?view=volunteers",
    hasContent: true,
  },
  {
    id: "fav-summer-social",
    label: "Summer Social Overview",
    icon: <CalendarDays size={16} strokeWidth={1.75} />,
    path: "/events",
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

/**
 * Real-data create modals for admin-migrate — split out so `useStories`/`useEvents`
 * (react-query hooks) are only ever mounted inside admin-migrate's QueryClientProvider,
 * never inside admin-preview, which has none and must stay free of real Supabase calls.
 */
function MigrateCreateModals({
  isNewStoryOpen,
  onCloseNewStory,
  isNewEventOpen,
  onCloseNewEvent,
  hrefFor,
}: {
  isNewStoryOpen: boolean;
  onCloseNewStory: () => void;
  isNewEventOpen: boolean;
  onCloseNewEvent: () => void;
  hrefFor: (path: string) => string;
}) {
  const router = useRouter();
  const { create: createStory } = useStories({ autoFetch: false });
  const { create: createEvent } = useEvents({ autoFetch: false });

  async function handleCreateStory(story: Omit<Story, "id">) {
    const authorId = await getCurrentPersonId();
    const created = await createStory({
      title: story.title,
      author_id: authorId,
      status: story.status === "Published" ? "published" : "draft",
      body: story.body || "",
    });
    if (created) router.push(hrefFor(`/content?view=stories&selected=${created.id}`));
  }

  async function handleCreateEvent(event: Omit<EventSummary, "id">) {
    const startsAt = event.date ? new Date(`${event.date}T00:00:00`).toISOString() : new Date().toISOString();
    const created = await createEvent({
      name: event.title,
      starts_at: startsAt,
      field_data: { location: event.location, description: event.description },
    });
    if (created) router.push(hrefFor(`/events/${created.id}`));
  }

  return (
    <>
      <NewStoryModal isOpen={isNewStoryOpen} onClose={onCloseNewStory} onCreate={handleCreateStory} />
      <NewEventModal isOpen={isNewEventOpen} onClose={onCloseNewEvent} onCreate={handleCreateEvent} />
    </>
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
  const basePath = useAdminBasePath();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isNewStoryOpen, setIsNewStoryOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [promotionModalType, setPromotionModalType] = useState<EventPromotionType | null>(null);
  const isMigrate = basePath === "/admin-migrate";
  // "Invoices" has no admin-migrate route yet — its admin-preview screen reuses
  // unrelated course/tuition mock data with no real equivalent to wire up.
  const visibleGroup2Items = isMigrate ? group2Items.filter((item) => item.id !== "invoices") : group2Items;

  function hrefFor(path: string): string {
    return `${basePath}${path}`;
  }

  function isSelected(path: string): boolean {
    return pathname === hrefFor(path).split("?")[0];
  }

  function openCreateOption(next: () => void) {
    setIsCreateMenuOpen(false);
    next();
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
            open={isCreateMenuOpen}
            onOpenChange={setIsCreateMenuOpen}
            trigger={
              <SidebarIconButton
                label="Create new issue"
                variant="primary"
                icon={<Plus size={16} strokeWidth={1.75} />}
              />
            }
          >
            <DropdownItem
              label="New Story"
              icon={<FileText size={16} strokeWidth={1.75} />}
              onSelect={() => openCreateOption(() => setIsNewStoryOpen(true))}
            />
            <DropdownItem
              label="New Event"
              icon={<CalendarDays size={16} strokeWidth={1.75} />}
              onSelect={() => openCreateOption(() => setIsNewEventOpen(true))}
            />
            <DropdownItem
              label="New Email"
              icon={<Mail size={16} strokeWidth={1.75} />}
              onSelect={() => openCreateOption(() => setPromotionModalType("email"))}
            />
            <DropdownItem
              label="New Social Post"
              icon={<Megaphone size={16} strokeWidth={1.75} />}
              onSelect={() => openCreateOption(() => setPromotionModalType("social"))}
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
              selected={isSelected(item.path)}
              onClick={() => router.push(hrefFor(item.path))}
              indicator={<ContentStatusDot hasContent={item.hasContent} />}
            />
          ))}
        </div>

        <SidebarSection title="Manage">
          {visibleGroup2Items.map((item) => (
            <MenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={isSelected(item.path)}
              onClick={() => router.push(hrefFor(item.path))}
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
              selected={isSelected(item.path)}
              onClick={() => router.push(hrefFor(item.path))}
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
              selected={isSelected(item.path)}
              onClick={() => router.push(hrefFor(item.path))}
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

      {isMigrate ? (
        <MigrateCreateModals
          isNewStoryOpen={isNewStoryOpen}
          onCloseNewStory={() => setIsNewStoryOpen(false)}
          isNewEventOpen={isNewEventOpen}
          onCloseNewEvent={() => setIsNewEventOpen(false)}
          hrefFor={hrefFor}
        />
      ) : (
        <>
          <NewStoryModal isOpen={isNewStoryOpen} onClose={() => setIsNewStoryOpen(false)} />
          <NewEventModal isOpen={isNewEventOpen} onClose={() => setIsNewEventOpen(false)} />
        </>
      )}
      <AddPromotionModal
        type={promotionModalType}
        onClose={() => setPromotionModalType(null)}
        onAdd={() => {}}
      />
    </div>
  );
}

import {
  ArrowLeftRight,
  Bike,
  CalendarDays,
  Compass,
  ExternalLink,
  FileText,
  HandCoins,
  Handshake,
  Home,
  Inbox,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Megaphone,
  Newspaper,
  Receipt,
  Route,
  RouteOff,
  Settings,
  Star,
  Store,
  Users,
} from "lucide-react";
import type {
  DropdownItem,
  NavGroupConfig,
  NavPanelConfig,
  NavVariant,
  ResolvedVariant,
} from "./NavPanelTypes";

const WORKSPACE_DROPDOWN: DropdownItem[] = [
  { type: "item", id: "settings", label: "Settings", href: "/admin/settings" },
  { type: "item", id: "invite", label: "Invite and manage members" },
  { type: "divider" },
  { type: "item", id: "logout", label: "Log out" },
];

const SHELL_PREVIEW_BASE = "/admin/shell-preview";

const SHELL_PREVIEW_WORKSPACE_DROPDOWN: DropdownItem[] = [
  { type: "item", id: "settings", label: "Settings" },
  { type: "item", id: "invite", label: "Invite and manage members" },
  { type: "divider" },
  { type: "item", id: "logout", label: "Log out" },
];

const EVENT_CONTEXT_DROPDOWN: DropdownItem[] = [
  { type: "item", id: "current", label: "Summer Social 2026" },
  { type: "item", id: "event-2", label: "Halloween Parade" },
  { type: "item", id: "event-3", label: "Something here" },
  { type: "divider" },
  { type: "item", id: "all", label: "See all events", href: "/admin/events" },
];

const LEAFLET_CONTEXT_DROPDOWN: DropdownItem[] = [
  { type: "item", id: "current", label: "March 2026" },
  { type: "item", id: "leaflet-2", label: "February 2026" },
  { type: "item", id: "leaflet-3", label: "January 2026" },
  { type: "divider" },
  { type: "item", id: "all", label: "See all leaflets", href: "/admin/leaflet" },
];

export const L1_CONFIG: NavPanelConfig = {
  level: "l1",
  ariaLabel: "Main navigation",
  header: "workspace",
  workspace: {
    dropdownId: "workspace",
    avatar: "AB",
    username: "Alex Benson",
    dropdownItems: WORKSPACE_DROPDOWN,
    activeDropdownItemId: "settings",
  },
  groups: [
    {
      id: "primary",
      items: [
        { id: "dashboard", label: "Dashboard", icon: Compass, href: "/admin" },
        { id: "action-items", label: "Action Items", icon: ListTodo, href: "/admin/action-items" },
        { id: "inbox", label: "Inbox", icon: Inbox, badge: "19", href: "/admin/inbox" },
        { id: "website", label: "Website", icon: ExternalLink, href: "/admin/site" },
      ],
    },
    {
      id: "favorites",
      header: "Favorites",
      collapsible: true,
      items: [
        { id: "fav-1", label: "Summer Social 2026", icon: Star, href: "#" },
        { id: "fav-2", label: "Invoicing", icon: Star, href: "#" },
        { id: "fav-3", label: "Sponsors", icon: Star, href: "#" },
      ],
    },
    {
      id: "manage",
      header: "Manage",
      items: [
        { id: "events", label: "Events", icon: CalendarDays, href: "/admin/events" },
        { id: "committees", label: "Committees", icon: Users, href: "/admin/committees" },
        { id: "leaflet", label: "Leaflet", icon: Newspaper, href: "/admin/leaflet" },
        { id: "invoicing", label: "Invoicing & Sponsors", icon: HandCoins, href: "/admin/finance" },
      ],
    },
    {
      id: "database",
      header: "Database",
      items: [
        { id: "neighbors", label: "Neighbors", icon: Home, href: "/admin/people" },
        { id: "members", label: "Members", icon: Handshake, href: "/admin/members" },
        { id: "businesses", label: "Businesses", icon: Store, href: "/admin/biz" },
        { id: "stories", label: "Stories", icon: FileText, href: "/admin/stories" },
      ],
    },
  ],
  footer: [
    { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
    { id: "logout", label: "Logout", icon: LogOut },
  ],
};

const SHELL_PREVIEW_L1_STATIC: Omit<NavPanelConfig, "groups"> & {
  groups: NavGroupConfig[];
} = {
  level: "l1",
  ariaLabel: "Main navigation",
  header: "workspace",
  workspace: {
    dropdownId: "workspace",
    avatar: "AB",
    username: "Alex Benson",
    dropdownItems: SHELL_PREVIEW_WORKSPACE_DROPDOWN,
    activeDropdownItemId: "settings",
  },
  groups: [],
  footer: [
    { id: "settings", label: "Settings", icon: Settings, notReady: true },
    { id: "logout", label: "Logout", icon: LogOut },
  ],
};

const SHELL_PREVIEW_PRIMARY_GROUP: NavGroupConfig = {
  id: "primary",
  items: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Compass,
      href: SHELL_PREVIEW_BASE,
      notReady: true,
    },
    {
      id: "action-items",
      label: "Action Items",
      icon: ListTodo,
      href: `${SHELL_PREVIEW_BASE}/action-items`,
    },
    {
      id: "inbox",
      label: "Inbox",
      icon: Inbox,
      badge: "19",
      href: `${SHELL_PREVIEW_BASE}/inbox`,
      notReady: true,
    },
    {
      id: "website",
      label: "Website",
      icon: ExternalLink,
      href: `${SHELL_PREVIEW_BASE}/site`,
      notReady: true,
    },
  ],
};

const SHELL_PREVIEW_MANAGE_GROUP: NavGroupConfig = {
  id: "manage",
  header: "Manage",
  items: [
    {
      id: "events",
      label: "Events",
      icon: CalendarDays,
      href: `${SHELL_PREVIEW_BASE}/events`,
    },
    { id: "committees", label: "Committees", icon: Users, notReady: true },
    {
      id: "leaflet",
      label: "Leaflet",
      icon: Newspaper,
      href: `${SHELL_PREVIEW_BASE}/leaflet`,
    },
    {
      id: "invoicing",
      label: "Invoicing & Sponsors",
      icon: HandCoins,
      href: `${SHELL_PREVIEW_BASE}/invoice`,
      notReady: true,
    },
  ],
};

const SHELL_PREVIEW_DATABASE_GROUP: NavGroupConfig = {
  id: "database",
  header: "Database",
  items: [
    {
      id: "neighbors",
      label: "Neighbors",
      icon: Home,
      href: `${SHELL_PREVIEW_BASE}/neighbors`,
    },
    {
      id: "members",
      label: "Members",
      icon: Handshake,
      href: `${SHELL_PREVIEW_BASE}/members`,
    },
    {
      id: "businesses",
      label: "Businesses",
      icon: Store,
      href: `${SHELL_PREVIEW_BASE}/businesses`,
    },
    {
      id: "stories",
      label: "Stories",
      icon: FileText,
      href: `${SHELL_PREVIEW_BASE}/stories`,
      notReady: true,
    },
  ],
};

export type ShellPreviewFavorite = {
  id: string;
  name: string;
  route: string;
};

export function buildShellPreviewL1Config(
  favorites: ShellPreviewFavorite[] = [],
): NavPanelConfig {
  const groups: NavGroupConfig[] = [SHELL_PREVIEW_PRIMARY_GROUP];

  if (favorites.length > 0) {
    groups.push({
      id: "favorites",
      header: "Favorites",
      collapsible: true,
      items: favorites.map((favorite) => ({
        id: favorite.id,
        label: favorite.name,
        icon: Star,
        href: favorite.route,
      })),
    });
  }

  groups.push(SHELL_PREVIEW_MANAGE_GROUP, SHELL_PREVIEW_DATABASE_GROUP);

  return {
    ...SHELL_PREVIEW_L1_STATIC,
    groups,
  };
}

/** @deprecated Use buildShellPreviewL1Config(favorites) for dynamic favorites. */
export const SHELL_PREVIEW_L1_CONFIG: NavPanelConfig = buildShellPreviewL1Config();

const SHELL_PREVIEW_BREADCRUMB_LABELS: Record<string, string> = {
  [SHELL_PREVIEW_BASE]: "Dashboard",
  [`${SHELL_PREVIEW_BASE}/action-items`]: "Action Items",
  [`${SHELL_PREVIEW_BASE}/inbox`]: "Inbox",
  [`${SHELL_PREVIEW_BASE}/site`]: "Website",
  [`${SHELL_PREVIEW_BASE}/events`]: "Events",
  [`${SHELL_PREVIEW_BASE}/leaflet`]: "Leaflet",
  [`${SHELL_PREVIEW_BASE}/invoice`]: "Invoicing & Sponsors",
  [`${SHELL_PREVIEW_BASE}/neighbors`]: "Neighbors",
  [`${SHELL_PREVIEW_BASE}/members`]: "Members",
  [`${SHELL_PREVIEW_BASE}/businesses`]: "Businesses",
  [`${SHELL_PREVIEW_BASE}/stories`]: "Stories",
};

export function parseShellPreviewEventId(pathname: string): string | null {
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const match = normalizedPath.match(/^\/admin\/shell-preview\/events\/([^/]+)/);
  return match?.[1] ?? null;
}

export function isShellPreviewLeafletRoute(pathname: string): boolean {
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  return (
    normalizedPath === `${SHELL_PREVIEW_BASE}/leaflet` ||
    normalizedPath.startsWith(`${SHELL_PREVIEW_BASE}/leaflet/`)
  );
}

export function isShellPreviewEventDetailRoute(pathname: string): boolean {
  return parseShellPreviewEventId(pathname) !== null;
}

export function buildShellPreviewLeafletL2Config(options?: {
  contextLabel?: string;
  dropdownItems?: DropdownItem[];
  activeDropdownItemId?: string;
}): NavPanelConfig {
  const contextLabel = options?.contextLabel ?? "Leaflet";
  const dropdownItems = options?.dropdownItems ?? [
    { type: "item", id: "current", label: contextLabel },
    { type: "divider" },
    {
      type: "item",
      id: "all",
      label: "See all leaflets",
      href: `${SHELL_PREVIEW_BASE}/leaflet`,
    },
  ];

  return {
    level: "l2",
    ariaLabel: "Leaflet navigation",
    back: { label: "Back", href: SHELL_PREVIEW_BASE },
    context: {
      dropdownId: "context",
      label: contextLabel,
      icon: CalendarDays,
      dropdownItems,
      activeDropdownItemId: options?.activeDropdownItemId ?? "current",
    },
    groups: [
      {
        id: "top",
        items: [
          {
            id: "overview",
            label: "Overview",
            icon: LayoutDashboard,
            href: `${SHELL_PREVIEW_BASE}/leaflet`,
          },
          {
            id: "tasks",
            label: "Tasks",
            icon: Users,
            href: `${SHELL_PREVIEW_BASE}/leaflet/todo`,
          },
        ],
      },
      {
        id: "manage",
        header: "Manage",
        items: [
          {
            id: "deliverers",
            label: "Deliverers",
            icon: Bike,
            href: `${SHELL_PREVIEW_BASE}/leaflet/deliverers`,
          },
          {
            id: "routes",
            label: "Routes",
            icon: Route,
            href: `${SHELL_PREVIEW_BASE}/leaflet/routes`,
          },
          {
            id: "open-routes",
            label: "Open Routes",
            icon: RouteOff,
            href: `${SHELL_PREVIEW_BASE}/leaflet/open-routes`,
          },
          {
            id: "substitutions",
            label: "Substitutions",
            icon: ArrowLeftRight,
            href: `${SHELL_PREVIEW_BASE}/leaflet/substitutions`,
          },
        ],
      },
      {
        id: "support",
        header: "Support",
        items: [
          {
            id: "sponsorships",
            label: "Sponsorships",
            icon: HandCoins,
            href: `${SHELL_PREVIEW_BASE}/leaflet/sponsorships`,
          },
        ],
      },
    ],
  };
}

export function buildShellPreviewEventL2Config(
  eventId: string,
  options?: {
    contextLabel?: string;
    dropdownItems?: DropdownItem[];
    activeDropdownItemId?: string;
  },
): NavPanelConfig {
  const contextLabel = options?.contextLabel ?? "Event";
  const dropdownItems = options?.dropdownItems ?? [
    { type: "item", id: eventId, label: contextLabel },
    { type: "divider" },
    {
      type: "item",
      id: "all",
      label: "See all events",
      href: `${SHELL_PREVIEW_BASE}/events`,
    },
  ];

  const eventBase = `${SHELL_PREVIEW_BASE}/events/${eventId}`;

  return {
    level: "l2",
    ariaLabel: "Event navigation",
    back: { label: "Back", href: `${SHELL_PREVIEW_BASE}/events` },
    context: {
      dropdownId: "context",
      label: contextLabel,
      icon: CalendarDays,
      dropdownItems,
      activeDropdownItemId: options?.activeDropdownItemId ?? eventId,
    },
    groups: [
      {
        id: "event-sections",
        items: [
          {
            id: "overview",
            label: "Overview",
            icon: LayoutDashboard,
            href: `${eventBase}/overview`,
          },
          { id: "details", label: "Event details", icon: FileText, href: "#", notReady: true },
          { id: "tasks", label: "Tasks", icon: ListTodo, href: "#", notReady: true },
          { id: "financials", label: "Financials", icon: HandCoins, href: "#", notReady: true },
          { id: "committees", label: "Committees", icon: Users, href: "#", notReady: true },
          { id: "broadcast", label: "Broadcast", icon: Megaphone, href: "#", notReady: true },
        ],
      },
    ],
  };
}

export function shellPreviewBreadcrumbLabel(pathname: string): string {
  const eventId = parseShellPreviewEventId(pathname);
  if (eventId) {
    return "Events";
  }

  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (SHELL_PREVIEW_BREADCRUMB_LABELS[normalizedPath]) {
    return SHELL_PREVIEW_BREADCRUMB_LABELS[normalizedPath];
  }

  for (const [path, label] of Object.entries(SHELL_PREVIEW_BREADCRUMB_LABELS)) {
    if (normalizedPath.startsWith(`${path}/`)) {
      return label;
    }
  }

  return "Dashboard";
}

export const SETTINGS_L2_CONFIG: NavPanelConfig = {
  level: "l2",
  ariaLabel: "Settings navigation",
  back: { label: "Back", href: "/admin" },
  header: "search",
  groups: [
    {
      id: "manage",
      header: "Manage",
      items: [
        { id: "profile", label: "Profile", icon: Compass, href: "/admin/settings/profile" },
        { id: "committees", label: "My Committees", icon: Users, href: "/admin/settings/committees" },
      ],
    },
    {
      id: "admin",
      header: "Admin",
      items: [
        {
          id: "event-templates",
          label: "Event Templates",
          icon: CalendarDays,
          href: "/admin/settings/event-templates",
        },
        {
          id: "email-templates",
          label: "Email Templates",
          icon: Users,
          href: "/admin/settings/email-templates",
        },
        {
          id: "user-access",
          label: "User access",
          icon: Newspaper,
          href: "/admin/settings/user-access",
        },
      ],
    },
  ],
};

export const EVENT_L2_CONFIG: NavPanelConfig = {
  level: "l2",
  ariaLabel: "Event navigation",
  back: { label: "Back", href: "/admin/events" },
  context: {
    dropdownId: "context",
    label: "Summer Social 2026",
    icon: CalendarDays,
    dropdownItems: EVENT_CONTEXT_DROPDOWN,
    activeDropdownItemId: "current",
  },
  groups: [
    {
      id: "event-sections",
      items: [
        {
          id: "overview",
          label: "Overview",
          icon: LayoutDashboard,
          href: "#",
          active: true,
        },
        { id: "details", label: "Event details", icon: FileText, href: "#" },
        { id: "tasks", label: "Tasks", icon: ListTodo, href: "#" },
        { id: "financials", label: "Financials", icon: HandCoins, href: "#" },
        { id: "committees", label: "Committees", icon: Users, href: "#" },
        { id: "broadcast", label: "Broadcast", icon: Megaphone, href: "#" },
      ],
    },
  ],
};

export const LEAFLET_L2_CONFIG: NavPanelConfig = {
  level: "l2",
  ariaLabel: "Leaflet navigation",
  back: { label: "Back", href: "/admin/leaflet" },
  context: {
    dropdownId: "context",
    label: "March 2026",
    icon: CalendarDays,
    dropdownItems: LEAFLET_CONTEXT_DROPDOWN,
    activeDropdownItemId: "current",
  },
  groups: [
    {
      id: "top",
      items: [
        {
          id: "overview",
          label: "Overview",
          icon: LayoutDashboard,
          href: "#",
          active: true,
        },
        { id: "tasks", label: "Tasks", icon: Users, href: "#" },
      ],
    },
    {
      id: "manage",
      header: "Manage",
      items: [
        { id: "deliverers", label: "Deliverers", icon: Bike, href: "#" },
        { id: "routes", label: "Routes", icon: Route, href: "#" },
        { id: "open-routes", label: "Open Routes", icon: RouteOff, href: "#" },
        { id: "substitutions", label: "Substitutions", icon: ArrowLeftRight, href: "#" },
      ],
    },
    {
      id: "support",
      header: "Support",
      items: [
        { id: "sponsorships", label: "Sponsorships", icon: HandCoins, href: "#" },
        { id: "invoices", label: "Invoices", icon: Receipt, href: "#" },
      ],
    },
  ],
};

export const NAV_VARIANT_LABELS: Record<NavVariant, string> = {
  l1: "L1",
  "l1-dropdown": "L1 Dropdown",
  settings: "Settings",
  event: "L2 — Event",
  "event-dropdown": "L2 — Event Dropdown",
  leaflet: "L2 — Leaflet",
  "leaflet-dropdown": "L2 — Leaflet Dropdown",
};

export function resolveVariant(variant: NavVariant): ResolvedVariant {
  switch (variant) {
    case "l1":
      return { config: L1_CONFIG, openDropdownId: null };
    case "l1-dropdown":
      return { config: L1_CONFIG, openDropdownId: "workspace" };
    case "settings":
      return { config: SETTINGS_L2_CONFIG, openDropdownId: null };
    case "event":
      return { config: EVENT_L2_CONFIG, openDropdownId: null };
    case "event-dropdown":
      return { config: EVENT_L2_CONFIG, openDropdownId: "context" };
    case "leaflet":
      return { config: LEAFLET_L2_CONFIG, openDropdownId: null };
    case "leaflet-dropdown":
      return { config: LEAFLET_L2_CONFIG, openDropdownId: "context" };
  }
}

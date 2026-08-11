"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  PencilLine,
  Search,
  X,
} from "lucide-react";
import type {
  DropdownItem,
  NavBackConfig,
  NavGroupConfig,
  NavItemConfig,
  NavPanelConfig,
  WorkspaceConfig,
} from "./NavPanelTypes";
import { normalizeRoute } from "@/lib/favorites/normalizeRoute";
import { getBestMatchingHref } from "@/lib/nav/getBestMatchingHref";

type NavPanelProps = {
  config: NavPanelConfig;
  openDropdownId?: string | null;
  onDropdownToggle?: (dropdownId: string | null) => void;
  onBack?: () => void;
  /** When true, derive active state from the current pathname instead of item.active */
  resolveActiveFromPathname?: boolean;
};

function NavDropdown({
  items,
  open,
  activeId,
  className,
  onClose,
}: {
  items: DropdownItem[];
  open: boolean;
  activeId?: string;
  className?: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={["shell-nav-dropdown", className].filter(Boolean).join(" ")}
      role="menu"
    >
      {items.map((item, i) =>
        item.type === "divider" ? (
          <div key={`divider-${i}`} className="shell-nav-dropdown-spacer" aria-hidden />
        ) : item.href ? (
          <Link
            key={item.id}
            href={item.href}
            className={`shell-nav-dropdown-item${item.id === activeId ? " shell-nav-dropdown-item--active" : ""}`}
            role="menuitem"
            onClick={onClose}
          >
            {item.label}
          </Link>
        ) : (
          <button
            key={item.id}
            type="button"
            className={`shell-nav-dropdown-item${item.id === activeId ? " shell-nav-dropdown-item--active" : ""}`}
            role="menuitem"
            onClick={onClose}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}

function NavBackLink({
  back,
  onBack,
}: {
  back: NavBackConfig;
  onBack?: () => void;
}) {
  const content = (
    <>
      <ChevronRight className="shell-nav-back-chevron" size={14} strokeWidth={1.5} />
      {back.label}
    </>
  );

  if (onBack) {
    return (
      <button type="button" className="shell-nav-back" onClick={onBack}>
        {content}
      </button>
    );
  }

  return (
    <Link href={back.href} className="shell-nav-back">
      {content}
    </Link>
  );
}

function NavWorkspaceHeader({
  workspace,
  open,
  onToggle,
}: {
  workspace: WorkspaceConfig;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <header className="shell-nav-header shell-nav-header--workspace" data-variant="workspace">
      <div className="shell-nav-workspace-trigger">
        <button
          type="button"
          className="shell-nav-user shell-nav-user-trigger"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={onToggle}
        >
          <span className="shell-nav-avatar">{workspace.avatar}</span>
          <span className="shell-nav-username">{workspace.username}</span>
          <ChevronDown className="shell-nav-chevron" size={12} strokeWidth={1.5} />
        </button>
      </div>
      <div className="shell-nav-actions">
        <button type="button" className="shell-nav-search" aria-label="Search">
          <Search size={16} strokeWidth={1.5} />
        </button>
        <button type="button" className="shell-nav-compose" aria-label="Compose">
          <PencilLine size={12} strokeWidth={1.5} />
        </button>
      </div>
      <NavDropdown
        items={workspace.dropdownItems}
        open={open}
        activeId={workspace.activeDropdownItemId}
        className="shell-nav-dropdown--workspace"
        onClose={() => onToggle()}
      />
    </header>
  );
}

function NavSearchBar() {
  return (
    <div className="shell-nav-search-bar">
      <Search size={16} strokeWidth={1.5} />
      <span className="shell-nav-search-label">Search</span>
    </div>
  );
}

function NavContextBlock({
  context,
  open,
  onToggle,
}: {
  context: NonNullable<NavPanelConfig["context"]>;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = context.icon;

  return (
    <div className="shell-nav-context-trigger-wrap">
      <button
        type="button"
        className="shell-nav-context-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={onToggle}
      >
        <span className="shell-nav-context-trigger-left">
          <span className="shell-nav-context-icon">
            <Icon size={14} strokeWidth={1.5} />
          </span>
          <span className="shell-nav-context-label">{context.label}</span>
        </span>
        <ChevronsUpDown className="shell-nav-chevron" size={12} strokeWidth={1.5} />
      </button>
      <NavDropdown
        items={context.dropdownItems}
        open={open}
        activeId={context.activeDropdownItemId}
        className="shell-nav-dropdown--context"
        onClose={onToggle}
      />
    </div>
  );
}

function NavItemRow({
  item,
  active,
}: {
  item: NavItemConfig;
  active: boolean;
}) {
  const Icon = item.icon;
  const Affordance = item.affordanceIcon;
  const className = [
    "shell-nav-item",
    active ? "shell-nav-item--active" : "",
    item.notReady ? "shell-nav-item--not-ready shell-tooltip" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const label = item.notReady ? <em>{item.label}</em> : item.label;
  const tooltipProps = item.notReady ? { "data-tooltip": "Coming soon" } : {};

  const content = (
    <>
      <Icon size={16} strokeWidth={1.5} />
      {Affordance ? (
        <span className="shell-nav-item-affordance">
          <Affordance size={16} strokeWidth={1.5} />
        </span>
      ) : null}
      <span className="shell-nav-item-label">{label}</span>
      {item.badge ? <span className="shell-nav-badge">{item.badge}</span> : null}
      {item.onRemove ? (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Remove ${item.label}`}
          className="shell-nav-item-remove"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            item.onRemove?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              item.onRemove?.();
            }
          }}
        >
          <X size={12} strokeWidth={1.5} />
        </span>
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <li className="shell-nav-list-item">
        <Link href={item.href} className={className} data-active={active || undefined} {...tooltipProps}>
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className="shell-nav-list-item">
      <button type="button" className={className} {...tooltipProps}>
        {content}
      </button>
    </li>
  );
}

function NavGroup({
  group,
  collapsed,
  onToggleCollapse,
  resolveActiveFromPathname,
  activeHref,
}: {
  group: NavGroupConfig;
  collapsed: boolean;
  onToggleCollapse: () => void;
  resolveActiveFromPathname: boolean;
  activeHref?: string;
}) {
  return (
    <section className="shell-nav-group" data-collapsible={group.collapsible || undefined}>
      {group.header ? (
        group.collapsible ? (
          <button
            type="button"
            className="shell-nav-group-header shell-nav-group-header--button"
            aria-expanded={!collapsed}
            onClick={onToggleCollapse}
          >
            <span>{group.header}</span>
            <ChevronDown
              className={`shell-nav-chevron${collapsed ? " shell-nav-chevron--collapsed" : ""}`}
              size={12}
              strokeWidth={1.5}
            />
          </button>
        ) : (
          <div className="shell-nav-group-header">
            <span>{group.header}</span>
          </div>
        )
      ) : null}
      {!collapsed && (
        <ul className="shell-nav-list" role="list">
          {group.items.map((item) => (
            <NavItemRow
              key={item.id}
              item={item}
              active={
                resolveActiveFromPathname
                  ? Boolean(item.href) && item.href === activeHref
                  : Boolean(item.active)
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function NavPanel({
  config,
  openDropdownId = null,
  onDropdownToggle,
  onBack,
  resolveActiveFromPathname = false,
}: NavPanelProps) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const currentRoute = useMemo(() => {
    const search = searchParams.toString();
    return normalizeRoute(search ? `${pathname}?${search}` : pathname);
  }, [pathname, searchParams]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const g of config.groups) {
      if (g.collapsible && g.defaultCollapsed) {
        initial[g.id] = true;
      }
    }
    return initial;
  });

  const toggleDropdown = useCallback(
    (id: string) => {
      onDropdownToggle?.(openDropdownId === id ? null : id);
    },
    [openDropdownId, onDropdownToggle],
  );

  const workspaceOpen =
    config.workspace != null && openDropdownId === config.workspace.dropdownId;
  const contextOpen =
    config.context != null && openDropdownId === config.context.dropdownId;

  const hasTopBlock = config.back || config.header === "search" || config.context;

  const activeHref = useMemo(() => {
    if (!resolveActiveFromPathname) return undefined;
    const allHrefs = [
      ...config.groups.flatMap((group) => group.items.map((item) => item.href)),
      ...(config.footer ?? []).map((item) => item.href),
    ];
    return getBestMatchingHref(currentRoute, allHrefs);
  }, [resolveActiveFromPathname, config.groups, config.footer, currentRoute]);

  return (
    <nav
      className={`shell-nav shell-nav--${config.level}`}
      aria-label={config.ariaLabel}
    >
      <div className="shell-nav-scroll">
        <div className="shell-nav-main">
          {config.header === "workspace" && config.workspace ? (
            <NavWorkspaceHeader
              workspace={config.workspace}
              open={workspaceOpen}
              onToggle={() => toggleDropdown(config.workspace!.dropdownId)}
            />
          ) : null}

          {hasTopBlock ? (
            <div className="shell-nav-top-block">
              {config.back ? <NavBackLink back={config.back} onBack={onBack} /> : null}
              {config.header === "search" ? <NavSearchBar /> : null}
              {config.context ? (
                <NavContextBlock
                  context={config.context}
                  open={contextOpen}
                  onToggle={() => toggleDropdown(config.context!.dropdownId)}
                />
              ) : null}
            </div>
          ) : null}

          <div className="shell-nav-body">
            {config.groups.map((group) => (
              <NavGroup
                key={group.id}
                group={group}
                collapsed={collapsedGroups[group.id] ?? false}
                resolveActiveFromPathname={resolveActiveFromPathname}
                activeHref={activeHref}
                onToggleCollapse={() =>
                  setCollapsedGroups((prev) => ({
                    ...prev,
                    [group.id]: !prev[group.id],
                  }))
                }
              />
            ))}
          </div>
        </div>
      </div>
      {config.footer ? (
        <footer className="shell-nav-footer">
          <ul className="shell-nav-list" role="list">
            {config.footer.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                active={
                  resolveActiveFromPathname
                    ? Boolean(item.href) && item.href === activeHref
                    : Boolean(item.active)
                }
              />
            ))}
          </ul>
        </footer>
      ) : null}
    </nav>
  );
}

"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  ArrowRightIcon,
  BoxCubeIcon,
  BoxIcon,
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  CalenderIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

type NavLink = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  /** Custom active check (e.g. /events vs /events?view=calendar) */
  matchSearch?: (sp: URLSearchParams) => boolean;
  /** Also active for /events/foo when this item is the default /events child */
  includeDescendantPaths?: boolean;
};

type NavSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: NavLink[];
  /** e.g. /events/foo when only /events is listed as an item path */
  pathPrefixes?: string[];
  /** Section header row navigates here (default “all” view); omit duplicate sub-link */
  rootPath: string;
  /** Optional rules for when the root row counts as active (pathname/query/descendants) */
  rootMatch?: Pick<NavLink, "matchSearch" | "includeDescendantPaths">;
};

function linkMatches(
  pathname: string,
  sp: URLSearchParams,
  item: NavLink,
): boolean {
  const q = item.path.indexOf("?");
  const path = q === -1 ? item.path : item.path.slice(0, q);
  const queryString = q === -1 ? "" : item.path.slice(q + 1);
  if (pathname !== path) {
    if (
      item.includeDescendantPaths &&
      pathname.startsWith(`${path}/`) &&
      (!item.matchSearch || item.matchSearch(sp))
    ) {
      return true;
    }
    return false;
  }
  if (item.matchSearch) return item.matchSearch(sp);
  if (queryString) {
    const required = new URLSearchParams(queryString);
    for (const [key, value] of required.entries()) {
      if (sp.get(key) !== value) return false;
    }
  }
  return true;
}

function sectionIdForLocation(
  pathname: string,
  sp: URLSearchParams,
  sections: NavSection[],
): string | null {
  for (const section of sections) {
    if (
      linkMatches(pathname, sp, {
        name: "",
        path: section.rootPath,
        ...section.rootMatch,
      })
    ) {
      return section.id;
    }
    for (const item of section.items) {
      if (linkMatches(pathname, sp, item)) return section.id;
    }
  }
  for (const section of sections) {
    if (
      section.pathPrefixes?.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      )
    ) {
      return section.id;
    }
  }
  return null;
}

const mainNavSections: NavSection[] = [
  {
    id: "neighbors",
    title: "Neighbors",
    icon: <GroupIcon />,
    rootPath: "/neighbors",
    pathPrefixes: ["/neighbors"],
    items: [
      {
        name: "Duplicate members",
        path: "/neighbors/duplicate-memberships",
        pro: false,
      },
    ],
  },
  {
    id: "routes",
    title: "Routes",
    icon: <ArrowRightIcon />,
    rootPath: "/routes/all",
    pathPrefixes: ["/routes"],
    items: [
      { name: "Claimed routes", path: "/routes/claimed", pro: false },
      { name: "Deliverers", path: "/routes/deliverers", pro: false },
      { name: "Open routes", path: "/routes/open", pro: false },
    ],
  },
  {
    id: "business",
    title: "Business",
    icon: <BoxIcon />,
    rootPath: "/businesses/all",
    pathPrefixes: ["/businesses", "/billing"],
    items: [
      { name: "Members", path: "/businesses/members", pro: false },
      { name: "Sponsors", path: "/businesses/sponsors", pro: false },
      { name: "Invoices", path: "/billing/invoices", pro: false },
    ],
  },
  {
    id: "events",
    title: "Events",
    icon: <CalenderIcon />,
    rootPath: "/events",
    rootMatch: {
      matchSearch: (s) => s.get("view") !== "calendar",
      includeDescendantPaths: true,
    },
    pathPrefixes: ["/events"],
    items: [
      {
        name: "Calendar",
        path: "/events?view=calendar",
        pro: false,
        matchSearch: (s) => s.get("view") === "calendar",
      },
    ],
  },
  {
    id: "features",
    title: "Features",
    icon: <TaskIcon />,
    rootPath: "/features/dashboard",
    pathPrefixes: ["/features", "/marketing"],
    items: [
      { name: "Website", path: "/features/website", pro: false },
      { name: "Banners", path: "/features/banners", pro: false },
      { name: "Marketing email", path: "/marketing/email", pro: false },
      { name: "Ecommerce", path: "/", pro: false },
    ],
  },
];

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
  },
  {
    name: "Forms",
    icon: <ListIcon />,
    subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    name: "Tables",
    icon: <TableIcon />,
    subItems: [
      { name: "Basic Tables", path: "/basic-tables", pro: false },
      { name: "Mercury-style table", path: "/mercury-table", pro: false },
      { name: "Table widgets", path: "/table-widgets", pro: false },
    ],
  },
  {
    name: "Pages",
    icon: <PageIcon />,
    subItems: [
      { name: "Blank Page", path: "/blank", pro: false },
      { name: "404 Error", path: "/error-404", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/login", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    hideSidebarMenuSections,
  } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const labelsVisible = isExpanded || isHovered || isMobileOpen;

  const activeMainSectionId = sectionIdForLocation(
    pathname,
    searchParams,
    mainNavSections,
  );

  const [expandedMainSectionId, setExpandedMainSectionId] = useState<
    string | null
  >(activeMainSectionId);

  const searchKey = searchParams.toString();
  useEffect(() => {
    setExpandedMainSectionId(
      sectionIdForLocation(pathname, searchParams, mainNavSections),
    );
  }, [pathname, searchKey]);

  const isActive = useCallback(
    (item: NavLink) => linkMatches(pathname, searchParams, item),
    [pathname, searchParams],
  );

  const subNavLinkActiveClass =
    "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300";

  const renderMainNav = () => (
    <ul className="flex flex-col gap-1">
      {mainNavSections.map((section) => {
        const isExpandedSection = expandedMainSectionId === section.id;
        const rootActive = linkMatches(pathname, searchParams, {
          name: "",
          path: section.rootPath,
          ...section.rootMatch,
        });
        const sectionHasActive =
          section.items.some((item) => isActive(item)) || rootActive;
        const rowLooksActive = isExpandedSection || sectionHasActive;

        const justify = !labelsVisible
          ? "lg:justify-center"
          : "lg:justify-start";

        const headerClass = rootActive
          ? `flex w-full cursor-pointer items-center gap-3 border-none text-left outline-offset-2 ${justify} rounded-mercury-subtle px-2 py-1.5 text-mercury-caption font-medium leading-tight ${subNavLinkActiveClass} group`
          : `menu-item group w-full cursor-pointer border-none text-left ${rowLooksActive ? "menu-item-active" : "menu-item-inactive"} ${justify}`;

        const headerInner = (
          <>
            <span
              className={
                rowLooksActive
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }
            >
              {section.icon}
            </span>
            {labelsVisible && (
              <span className="menu-item-text min-w-0 flex-1 truncate">
                {section.title}
              </span>
            )}
          </>
        );

        return (
          <li key={section.id}>
            <Link
              href={section.rootPath}
              aria-expanded={labelsVisible ? isExpandedSection : false}
              onClick={(e) => {
                if (isExpandedSection) {
                  e.preventDefault();
                  setExpandedMainSectionId(null);
                  return;
                }
                setExpandedMainSectionId(section.id);
              }}
              className={headerClass}
            >
              {headerInner}
            </Link>

            {labelsVisible && isExpandedSection && (
              <div className="mt-1 pl-2">
                <ul
                  className="space-y-0.5 border-l border-mercury-line py-0.5 pl-3 dark:border-white/15"
                  role="list"
                >
                  {section.items.map((item) => (
                    <li key={`${section.id}-${item.path}-${item.name}`}>
                      <Link
                        href={item.path}
                        className={`block rounded-mercury-subtle px-2 py-1.5 text-mercury-caption font-medium leading-tight ${
                          isActive(item)
                            ? subNavLinkActiveClass
                            : "text-mercury-ink hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActiveLegacy = useCallback(
    (path: string) => path === pathname,
    [pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActiveLegacy(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActiveLegacy]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    items: NavItem[],
    menuType: "main" | "others",
  ) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              type="button"
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActiveLegacy(nav.path)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActiveLegacy(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 border-l border-mercury-line ml-4 pl-3 dark:border-white/15">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActiveLegacy(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="ml-auto flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActiveLegacy(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActiveLegacy(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-mercury-line bg-mercury-sidebar-canvas text-mercury-ink transition-all duration-300 ease-in-out dark:border-white/10 dark:bg-mercury-surface-inverse dark:text-white/90 mt-16 px-3 lg:mt-0
        ${
          isExpanded || isMobileOpen
            ? "w-[199px]"
            : isHovered
              ? "w-[199px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="no-scrollbar flex flex-col overflow-y-auto pt-6 duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-2">{renderMainNav()}</div>

          {!hideSidebarMenuSections && (
            <div className="mt-6 border-t border-mercury-line pt-4 dark:border-white/10">
              <div>
                <h2
                  className={`mb-3 flex text-mercury-caption uppercase leading-[20px] text-mercury-muted dark:text-white/45 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Menu"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>

              <div className="mt-4">
                <h2
                  className={`mb-3 flex text-mercury-caption uppercase leading-[20px] text-mercury-muted dark:text-white/45 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

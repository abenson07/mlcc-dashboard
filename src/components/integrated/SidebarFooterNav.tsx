import type { ReactNode } from "react";
import SidebarActionItemsNavItem from "./SidebarActionItemsNavItem";
import SidebarSettingsNavItem from "./SidebarSettingsNavItem";
import SidebarSignOutNavItem from "./SidebarSignOutNavItem";

type SidebarFooterNavProps = {
  beforeFooter?: ReactNode;
};

export default function SidebarFooterNav({ beforeFooter }: SidebarFooterNavProps) {
  return (
    <div className="lf-sidebar-footer">
      {beforeFooter}
      <SidebarActionItemsNavItem />
      <SidebarSettingsNavItem />
      <SidebarSignOutNavItem />
    </div>
  );
}

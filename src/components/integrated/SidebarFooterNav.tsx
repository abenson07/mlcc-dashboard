import type { ReactNode } from "react";
import SidebarActionItemsNavItem from "./SidebarActionItemsNavItem";
import SidebarSettingsNavItem from "./SidebarSettingsNavItem";

type SidebarFooterNavProps = {
  beforeFooter?: ReactNode;
};

export default function SidebarFooterNav({ beforeFooter }: SidebarFooterNavProps) {
  return (
    <div className="lf-sidebar-footer">
      {beforeFooter}
      <SidebarActionItemsNavItem />
      <SidebarSettingsNavItem />
    </div>
  );
}

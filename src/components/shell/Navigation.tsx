"use client";

import type { ComponentType } from "react";
import {
  CalendarDays,
  ChevronDown,
  Compass,
  ExternalLink,
  FileText,
  HandCoins,
  Handshake,
  Home,
  Inbox,
  ListTodo,
  LogOut,
  Newspaper,
  PencilLine,
  Search,
  Settings,
  Star,
  Store,
  Users,
} from "lucide-react";

function NavItem({
  icon: Icon,
  label,
  badge,
}: {
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  label: string;
  badge?: string;
}) {
  return (
    <div className="shell-nav-item">
      <Icon size={16} strokeWidth={1.5} />
      <span>{label}</span>
      {badge ? <span className="shell-nav-badge">{badge}</span> : null}
    </div>
  );
}

function NavGroupHeader({ label, chevron }: { label: string; chevron?: boolean }) {
  return (
    <div className="shell-nav-group-header">
      <span>{label}</span>
      {chevron ? <ChevronDown className="shell-nav-chevron" size={12} strokeWidth={1.5} /> : null}
    </div>
  );
}

export default function Navigation() {
  return (
    <nav className="shell-nav" aria-label="Main navigation">
      <div className="shell-nav-main">
        <div className="shell-nav-header">
          <div className="shell-nav-user">
            <span className="shell-nav-avatar">AB</span>
            <span className="shell-nav-username">Alex Benson</span>
            <ChevronDown className="shell-nav-chevron" size={12} strokeWidth={1.5} />
          </div>
          <div className="shell-nav-actions">
            <button type="button" className="shell-nav-search" aria-label="Search">
              <Search size={16} strokeWidth={1.5} />
            </button>
            <button type="button" className="shell-nav-compose" aria-label="Compose">
              <PencilLine size={12} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="shell-nav-group">
          <NavItem icon={Compass} label="Dashboard" />
          <NavItem icon={ListTodo} label="Action Items" />
          <NavItem icon={Inbox} label="Inbox" badge="19" />
          <NavItem icon={ExternalLink} label="Website" />
        </div>

        <div className="shell-nav-group">
          <NavGroupHeader label="Favorites" chevron />
          <NavItem icon={Star} label="Summer Social 2026" />
          <NavItem icon={Star} label="Invoicing" />
          <NavItem icon={Star} label="Sponsors" />
        </div>

        <div className="shell-nav-group">
          <NavGroupHeader label="Manage" />
          <NavItem icon={CalendarDays} label="Events" />
          <NavItem icon={Users} label="Committees" />
          <NavItem icon={Newspaper} label="Leaflet" />
          <NavItem icon={HandCoins} label="Invoicing & Sponsors" />
        </div>

        <div className="shell-nav-group">
          <NavGroupHeader label="Database" />
          <NavItem icon={Home} label="Neighbors" />
          <NavItem icon={Handshake} label="Members" />
          <NavItem icon={Store} label="Businesses" />
          <NavItem icon={FileText} label="Stories" />
        </div>
      </div>

      <div className="shell-nav-footer">
        <NavItem icon={Settings} label="Settings" />
        <NavItem icon={LogOut} label="Logout" />
      </div>
    </nav>
  );
}

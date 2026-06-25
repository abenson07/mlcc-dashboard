"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronDown, IconPlus } from "@/components/leaflet/icons";
import IntegratedTopbar from "../IntegratedTopbar";

export default function SitePageContent() {
  const pathname = usePathname();
  const onComments = pathname?.startsWith("/admin/site/comments");

  return (
  <>
    <IntegratedTopbar
      center={
        <button type="button" className="lf-context-ribbon">
          MLCC Website
          <IconChevronDown />
        </button>
      }
      primaryAction={
        <div className="lf-topbar-controls-inline">
          <Link href={onComments ? "/admin/site" : "/admin/site/comments"} className="lf-btn lf-btn--outline">
            {onComments ? "Hide comments" : "Comments"}
          </Link>
        </div>
      }
    />
    <div className="lf-main lf-main--site">
      <div className="lf-content-col lf-content-col--full">
        <div className="lf-site-canvas-wrap">
          <div className="lf-site-canvas">
            <button type="button" className="lf-site-canvas-perms">
              Canvas permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}

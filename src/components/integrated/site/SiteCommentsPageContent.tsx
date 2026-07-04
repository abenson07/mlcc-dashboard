"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChevronDown, IconPlus } from "@/components/leaflet/icons";
import IntegratedTopbar from "../IntegratedTopbar";
import { MOCK_SITE_COMMENTS } from "../mockData";

export default function SiteCommentsPageContent() {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

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
          <Link href="/old-admin/site" className="lf-btn lf-btn--outline">
            Hide comments
          </Link>
        }
      />
      <div className="lf-main lf-main--site-comments">
        <div className="lf-content-col">
          <div className="lf-site-canvas-wrap">
            <div className="lf-site-canvas" />
          </div>
        </div>
        <aside className="lf-comments-col">
          <div className="lf-comments-header">
            <span className="lf-comments-title">Comments</span>
            <button type="button" className="lf-icon-btn" aria-label="Add comment">
              <IconPlus />
            </button>
          </div>
          <div className="lf-comments-list">
            {MOCK_SITE_COMMENTS.map((comment) => (
              <article key={comment.id} className="lf-comment-card">
                <div className="lf-comment-card-top">
                  <strong>{comment.author}</strong>
                  <button
                    type="button"
                    className="lf-comment-menu-btn"
                    aria-label="Comment options"
                    onClick={() => setMenuOpen(menuOpen === comment.id ? null : comment.id)}
                  >
                    ···
                  </button>
                  {menuOpen === comment.id && (
                    <div className="lf-comment-menu">
                      <button type="button">Edit</button>
                      <button type="button" className="lf-text-red">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p>{comment.body}</p>
                <span className="lf-meta">{comment.date}</span>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

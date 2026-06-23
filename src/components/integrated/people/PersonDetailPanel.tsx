"use client";

import { useState } from "react";
import { IconMail, IconMapPin } from "@/components/leaflet/icons";
import { IconClose } from "@/components/leaflet/routes/leafletIcons";
import { usePeople, useRoutes } from "hooks";
import type { PersonWithMembership } from "hooks";
import {
  formatDisplayDate,
  personDetailSubtitle,
  personMemberSinceDate,
  personMembershipTierLabel,
} from "./peopleFilters";

type PersonDetailPanelProps = {
  person: PersonWithMembership;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function PersonDetailPanel({ person, onClose, onUpdated }: PersonDetailPanelProps) {
  const { update } = usePeople({ autoFetch: false });
  const [boardSaving, setBoardSaving] = useState(false);
  const isExecutiveBoard = person.is_executive_board ?? false;
  const membershipStatus = person.membership?.status ?? "Non-member";
  const subtitle = personDetailSubtitle(person);
  const memberSince = formatDisplayDate(personMemberSinceDate(person) ?? undefined);

  const { routes, loading: routesLoading } = useRoutes({
    autoFetch: true,
    filters: { delivererId: person.id },
  });

  return (
    <aside className="lf-person-detail">
      <div className="lf-person-detail-header">
        <div>
          <h2 className="lf-person-detail-name">{person.full_name ?? "—"}</h2>
          {subtitle ? <p className="lf-meta">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex shrink-0 rounded p-0.5 text-[#A1A1AA] hover:text-[#71717A]"
          aria-label="Close details"
        >
          <IconClose />
        </button>
      </div>

      <section className="lf-detail-card">
        <div className="lf-card-header">
          <span className="lf-card-title">Contact information</span>
        </div>
        <div className="lf-card-body">
          <div className="lf-detail-icon-row">
            <span className="lf-detail-label">Address</span>
            <span className="lf-detail-icon-value">
              <IconMapPin />
              {person.address ?? "—"}
            </span>
          </div>
          <div className="lf-detail-icon-row">
            <span className="lf-detail-label">Email</span>
            <span className="lf-detail-icon-value">
              <IconMail />
              {person.email ?? "—"}
            </span>
          </div>
          <div className="lf-detail-icon-row">
            <span className="lf-detail-label">Phone</span>
            <span className="lf-detail-icon-value">{person.phone ?? "—"}</span>
          </div>
        </div>
      </section>

      <section className="lf-detail-card">
        <div className="lf-card-header">
          <span className="lf-card-title">Membership info</span>
        </div>
        <div className="lf-card-body">
          <div className="lf-detail-row">
            <span className="lf-detail-label">Status</span>
            <span className="lf-status-badge lf-status-badge--green">{membershipStatus}</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Type</span>
            <span>{personMembershipTierLabel(person)}</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Member since</span>
            <span>{memberSince}</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Renewed</span>
            <span>{formatDisplayDate(person.membership?.last_renewal ?? undefined)}</span>
          </div>
        </div>
      </section>

      <section className="lf-detail-card">
        <div className="lf-card-header">
          <span className="lf-card-title">Council roles</span>
        </div>
        <div className="lf-card-body">
          <label className="lf-task-box">
            <input
              type="checkbox"
              checked={isExecutiveBoard}
              disabled={boardSaving}
              onChange={async (e) => {
                setBoardSaving(true);
                try {
                  await update(person.id, { is_executive_board: e.target.checked });
                  onUpdated?.();
                } finally {
                  setBoardSaving(false);
                }
              }}
            />
            <span>Executive board (default attendee for board meetings)</span>
          </label>
        </div>
      </section>

      {routesLoading ? null : routes.length > 0 ? (
        <section className="lf-detail-card">
          <div className="lf-card-header">
            <span className="lf-card-title">Leaflet routes</span>
          </div>
          <div className="lf-card-body">
            {routes.map((route) => (
              <div key={route.id} className="lf-detail-row">
                <span>{route.route_name}</span>
                {route.leaflet_count != null ? (
                  <span className="lf-meta">{route.leaflet_count} leaflets</span>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}

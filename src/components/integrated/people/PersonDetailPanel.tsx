"use client";

import { IconMail, IconMapPin } from "@/components/leaflet/icons";
import { IconClose } from "@/components/leaflet/routes/leafletIcons";
import type { PersonWithMembership } from "hooks";
import { formatDisplayDate, personStatusLabel } from "./peopleFilters";

type PersonDetailPanelProps = {
  person: PersonWithMembership;
  onClose: () => void;
};

export default function PersonDetailPanel({ person, onClose }: PersonDetailPanelProps) {
  const status = personStatusLabel(person);
  const memberSince = formatDisplayDate(
    person.membership?.start_date ?? person.created_at ?? undefined
  );
  const roleLabel = person.roles?.[0] ?? "Neighbor";

  return (
    <aside className="lf-person-detail">
      <div className="lf-person-detail-header">
        <div>
          <h2 className="lf-person-detail-name">{person.full_name ?? "—"}</h2>
          <p className="lf-meta">
            {roleLabel} · Member since {memberSince}
          </p>
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
            <span className="lf-status-badge lf-status-badge--green">{status}</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Type</span>
            <span>{person.membership?.tier ?? "—"}</span>
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
    </aside>
  );
}

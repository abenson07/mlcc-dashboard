"use client";

import { IconCalendar, IconMail, IconMapPin, IconUser } from "@/components/leaflet/icons";
import type { Person } from "../mockData";

export default function PersonDetailPanel({ person }: { person: Person }) {
  return (
    <aside className="lf-person-detail">
      <div className="lf-person-detail-header">
        <div>
          <h2 className="lf-person-detail-name">{person.name}</h2>
          <p className="lf-meta">
            {person.role} · Member since {person.memberSince}
          </p>
        </div>
        <button type="button" className="lf-small-btn">
          Edit
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
              {person.address}
            </span>
          </div>
          <div className="lf-detail-icon-row">
            <span className="lf-detail-label">Email</span>
            <span className="lf-detail-icon-value">
              <IconMail />
              {person.email}
            </span>
          </div>
          <div className="lf-detail-icon-row">
            <span className="lf-detail-label">Phone</span>
            <span className="lf-detail-icon-value">{person.phone}</span>
          </div>
          <div className="lf-detail-icon-row">
            <span className="lf-detail-label">Birthday</span>
            <span className="lf-detail-icon-value">
              <IconCalendar />
              {person.birthday}
            </span>
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
            <span className="lf-status-badge lf-status-badge--green">{person.status}</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Type</span>
            <span>{person.membershipType}</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Member since</span>
            <span>{person.memberSince}</span>
          </div>
          <div className="lf-detail-row">
            <span className="lf-detail-label">Renewed</span>
            <span>{person.renewed}</span>
          </div>
        </div>
      </section>

      {person.donations.length > 0 && (
        <section className="lf-detail-card">
          <div className="lf-card-header">
            <span className="lf-card-title">Donation history</span>
          </div>
          <div className="lf-card-body">
            {person.donations.map((d) => (
              <div key={d.date + d.label} className="lf-donation-row">
                <IconUser />
                <div>
                  <div className="lf-donation-amount">{d.amount}</div>
                  <div className="lf-meta">
                    {d.label} · {d.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

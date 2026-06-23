"use client";

import Link from "next/link";
import { useState } from "react";
import { IconPlus } from "@/components/leaflet/icons";
import AddVolunteerAskModal from "@/components/volunteers/AddVolunteerAskModal";
import AddVolunteerSignupModal from "./AddVolunteerSignupModal";
import { useEventContext } from "./EventContext";

export default function EventVolunteersPageContent() {
  const {
    loading,
    event,
    volunteerAsks,
    volunteerSignupTotal,
    refetchAll,
    readOnly,
  } = useEventContext();
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  if (loading && !event) {
    return <p className="lf-meta">Loading volunteers…</p>;
  }

  if (!event) {
    return (
      <div className="lf-empty-page">
        <h1 className="lf-h2">Event not found</h1>
        <Link href="/events" className="lf-link">Back to events</Link>
      </div>
    );
  }

  const allSignups = volunteerAsks.flatMap((ask) =>
    ask.signups.map((signup) => ({
      id: signup.id,
      name: signup.person?.full_name ?? "—",
      hub: ask.title,
      email: signup.person?.email ?? "—",
      hours: ask.commitment_quantity,
      status: "Confirmed" as const,
    })),
  );

  return (
    <div className="lf-page-layout">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 className="lf-h1">Volunteers</h1>
          <p className="lf-page-desc">
            {volunteerSignupTotal} signed up across {volunteerAsks.length} hubs
          </p>
        </div>
        {!readOnly && volunteerAsks.length > 0 && (
          <button type="button" className="lf-link" onClick={() => setSignupModalOpen(true)}>
            + Add volunteer
          </button>
        )}
      </div>

      <section className="lf-volunteer-hubs">
        {volunteerAsks.map((hub) => (
          <article key={hub.id} className="lf-volunteer-hub-card">
            <h3 className="lf-card-title">{hub.title}</h3>
            <div className="lf-detail-row">
              <span className="lf-detail-label">Registered</span>
              <span>
                {hub.signup_count} / {hub.quantity}
              </span>
            </div>
            <div className="lf-detail-row">
              <span className="lf-detail-label">Min hours</span>
              <span>
                {hub.commitment_quantity} {hub.commitment_unit}
              </span>
            </div>
            <div className="lf-detail-row">
              <span className="lf-detail-label">Target</span>
              <span>{hub.quantity}</span>
            </div>
          </article>
        ))}
        {!readOnly && (
          <button
            type="button"
            className="lf-volunteer-hub-card lf-volunteer-hub-card--new"
            onClick={() => setAskModalOpen(true)}
          >
            <IconPlus />
            New Volunteer Opportunity
          </button>
        )}
      </section>

      <section className="lf-card">
        <div className="lf-card-body">
          {allSignups.length === 0 ? (
            <p className="lf-meta">No volunteer signups yet.</p>
          ) : (
            <table className="lf-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Volunteer hub</th>
                  <th>Email</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allSignups.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 500 }}>{v.name}</td>
                    <td className="lf-meta">{v.hub}</td>
                    <td className="lf-meta">{v.email}</td>
                    <td>{v.hours} hrs</td>
                    <td>
                      <span className="lf-status-badge lf-status-badge--green">{v.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <AddVolunteerAskModal
        isOpen={askModalOpen}
        onClose={() => setAskModalOpen(false)}
        onCreated={() => void refetchAll()}
        eventId={event.id}
        eventLabel={event.title}
      />

      <AddVolunteerSignupModal
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        asks={volunteerAsks}
        onAdded={() => void refetchAll()}
        readOnly={readOnly}
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import InvoiceComposerModal from "@/components/billing/InvoiceComposerModal";
import AddSponsorModal from "@/components/sponsorship/AddSponsorModal";
import { useLeafletContext } from "../LeafletContext";

type SponsorTab = "all" | "paid" | "pledged" | "invoiced";
type InvoiceTab = "all" | "paid" | "sent" | "overdue" | "draft";

export default function SponsorshipsPageContent() {
  const {
    leaflet,
    sponsors,
    invoices,
    budget,
    sponsorshipTiers,
    readOnly,
    createSponsorship,
    updateSponsorship,
    updateLeaflet,
    refetchAll,
  } = useLeafletContext();
  const [sponsorTab, setSponsorTab] = useState<SponsorTab>("all");
  const [invoiceTab, setInvoiceTab] = useState<InvoiceTab>("all");
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(String(budget.sponsorshipGoal));
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  // Format number with commas as user types, strip non-digits
  const handleGoalChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly === "") {
      setGoalInput("");
      return;
    }
    // Store display value with commas
    const num = Number(digitsOnly);
    setGoalInput(num.toLocaleString("en-US"));
  };

  const goalNumericValue = (): number => {
    const stripped = goalInput.replace(/,/g, "");
    return stripped ? Number(stripped) : 0;
  };

  const filteredSponsors = useMemo(() => {
    if (sponsorTab === "paid") return sponsors.filter((s) => s.status === "Paid");
    if (sponsorTab === "pledged") return sponsors.filter((s) => s.status === "Pledged");
    if (sponsorTab === "invoiced") return sponsors.filter((s) => s.status === "Invoiced");
    return sponsors;
  }, [sponsors, sponsorTab]);

  const filteredInvoices = useMemo(() => {
    if (invoiceTab === "paid") return invoices.filter((i) => i.status === "Paid");
    if (invoiceTab === "sent") return invoices.filter((i) => i.status === "Sent");
    if (invoiceTab === "overdue") return invoices.filter((i) => i.status === "Overdue");
    if (invoiceTab === "draft") return invoices.filter((i) => i.status === "Draft");
    return invoices;
  }, [invoices, invoiceTab]);

  const openGoalModal = () => {
    setGoalInput(String(budget.sponsorshipGoal));
    setGoalError(null);
    setGoalModalOpen(true);
  };

  const saveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = goalNumericValue();
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setGoalError("Enter a valid goal amount.");
      return;
    }
    setGoalSaving(true);
    setGoalError(null);
    try {
      await updateLeaflet({ sponsorship_goal_cents: Math.round(parsed * 100) });
      setGoalModalOpen(false);
      await refetchAll();
    } catch (err) {
      setGoalError(err instanceof Error ? err.message : "Failed to save goal.");
    } finally {
      setGoalSaving(false);
    }
  };

  const leafletLabel = leaflet
    ? `${leaflet.title} — ${new Date(`${leaflet.distribution_date}T12:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    : undefined;

  return (
    <div className="lf-overview-layout lf-overview-layout--single">
      <div className="lf-overview-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <h1 className="lf-h2">Sponsorship</h1>
          {!readOnly && (
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="lf-link" onClick={() => setSponsorModalOpen(true)}>
                + Add sponsor
              </button>
              <button type="button" className="lf-link" onClick={() => setInvoiceModalOpen(true)}>
                Issue invoice
              </button>
            </div>
          )}
        </div>

        <div className="lf-overview-mid-row">
          <section className="lf-card">
            <div className="lf-card-header">
              <span className="lf-card-title">Budget & sponsorships</span>
              {!readOnly && (
                <button type="button" className="lf-link" onClick={openGoalModal}>
                  Edit goal
                </button>
              )}
            </div>
            <div className="lf-card-body">
              <div className="lf-metric-row">
                <span className="lf-metric-label">Sponsorship progress</span>
                <span>{budget.sponsorshipProgressPct}%</span>
              </div>
              <div className="lf-progress-track" style={{ marginBottom: 12 }}>
                <div className="lf-progress-fill" style={{ width: `${budget.sponsorshipProgressPct}%` }} />
              </div>
              <div className="lf-metric-row">
                <span className="lf-metric-label">Goal</span>
                <span>${budget.sponsorshipGoal.toLocaleString()}</span>
              </div>
              <div className="lf-metric-row">
                <span className="lf-metric-label">Raised</span>
                <span>${budget.raised.toLocaleString()}</span>
              </div>
              <div className="lf-metric-row">
                <span className="lf-metric-label">Pledged</span>
                <span>${budget.pledged.toLocaleString()}</span>
              </div>
            </div>
          </section>

          <section className="lf-card">
            <div className="lf-card-header"><span className="lf-card-title">Sponsorship levels</span></div>
            <div className="lf-card-body">
              {sponsorshipTiers.map((tier) => (
                <div key={tier.name} className="lf-detail-row">
                  <div>
                    <div style={{ fontWeight: 500 }}>{tier.name}</div>
                    <div className="lf-meta">${tier.amount.toLocaleString()}</div>
                  </div>
                  <span className={tier.left === "Sold out" ? "lf-status-muted" : "lf-status-paid"}>{tier.left}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Sponsors</span></div>
          <div className="lf-card-body">
            <div className="lf-sponsor-tabs">
              {(["all", "paid", "pledged", "invoiced"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={sponsorTab === tab ? "lf-tab lf-tab--active" : "lf-tab"}
                  onClick={() => setSponsorTab(tab)}
                >
                  {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {filteredSponsors.length === 0 ? (
              <p className="lf-meta">No sponsors yet.</p>
            ) : (
              <table className="lf-table">
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Level</th>
                    <th>Amount</th>
                    <th>Status</th>
                    {!readOnly && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredSponsors.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.business}</td>
                      <td className="lf-meta">{s.contact}</td>
                      <td className="lf-meta">{s.level}</td>
                      <td className="lf-meta">${s.amount.toLocaleString()}</td>
                      <td
                        className={
                          s.status === "Paid"
                            ? "lf-status-paid"
                            : s.status === "Pledged"
                              ? "lf-status-pledged"
                              : "lf-status-muted"
                        }
                      >
                        {s.status}
                      </td>
                      {!readOnly && (
                        <td>
                          {s.status !== "Paid" && (
                            <button
                              type="button"
                              className="lf-link"
                              onClick={() =>
                                void updateSponsorship(s.id, {
                                  status: "paid",
                                  paid_date: new Date().toISOString().slice(0, 10),
                                }).then(() => refetchAll())
                              }
                            >
                              Mark paid
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="lf-card">
          <div className="lf-card-header"><span className="lf-card-title">Invoices</span></div>
          <div className="lf-card-body">
            <div className="lf-sponsor-tabs">
              {(["all", "paid", "sent", "overdue", "draft"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={invoiceTab === tab ? "lf-tab lf-tab--active" : "lf-tab"}
                  onClick={() => setInvoiceTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {filteredInvoices.length === 0 ? (
              <p className="lf-meta">No invoices linked to this leaflet run.</p>
            ) : (
              <table className="lf-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Sponsor</th>
                    <th>Amount</th>
                    <th>Due date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 500 }}>{inv.invoice}</td>
                      <td className="lf-meta">{inv.sponsor}</td>
                      <td className="lf-meta">${inv.amount.toLocaleString()}</td>
                      <td className="lf-meta">{inv.dueDate}</td>
                      <td
                        className={
                          inv.status === "Paid"
                            ? "lf-status-paid"
                            : inv.status === "Overdue"
                              ? "lf-text-red"
                              : inv.status === "Sent"
                                ? "lf-text-green"
                                : "lf-status-muted"
                        }
                      >
                        {inv.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <AddSponsorModal
        isOpen={sponsorModalOpen}
        onClose={() => setSponsorModalOpen(false)}
        onSubmit={createSponsorship}
      />

      <InvoiceComposerModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        defaultLeafletId={leaflet?.id}
        defaultLeafletLabel={leafletLabel}
        onIssued={() => {
          setInvoiceModalOpen(false);
          void refetchAll();
        }}
      />

      <Modal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} className="max-w-md p-6">
        <form onSubmit={(e) => void saveGoal(e)}>
          <h2 className="lf-h2" style={{ marginBottom: 16 }}>
            Edit sponsorship goal
          </h2>
          {goalError ? <p className="lf-text-red" style={{ marginBottom: 12 }}>{goalError}</p> : null}
          <div>
            <Label>Goal ($)</Label>
            <input
              type="text"
              inputMode="numeric"
              value={goalInput}
              onChange={(e) => handleGoalChange(e.target.value)}
              placeholder="0"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400"
            />
          </div>
          <div className="flex items-center justify-end gap-3" style={{ marginTop: 24 }}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setGoalModalOpen(false)}
              disabled={goalSaving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={goalSaving}>
              {goalSaving ? "Saving…" : "Save goal"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

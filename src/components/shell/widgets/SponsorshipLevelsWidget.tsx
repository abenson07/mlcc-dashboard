"use client";

import { useState } from "react";
import EditSponsorshipTiersModal from "@/components/sponsorship/EditSponsorshipTiersModal";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import ShellWidget from "./ShellWidget";

export default function SponsorshipLevelsWidget() {
  const { sponsorshipTiers, sponsorshipTierSeeds, readOnly, saveSponsorshipTiers, refetchAll } =
    useLeafletContext();
  const [tiersModalOpen, setTiersModalOpen] = useState(false);

  return (
    <>
      <ShellWidget title="Sponsorship levels" cardId="sponsorship-levels">
        {sponsorshipTiers.map((tier) => (
          <div key={tier.name} className="lf-detail-row">
            <div>
              <div style={{ fontWeight: 500 }}>{tier.name}</div>
              <div className="lf-meta">
                ${tier.amount.toLocaleString()} · qty {tier.quantity}
              </div>
            </div>
            <span className={tier.left === "Sold out" ? "lf-status-muted" : "lf-status-paid"}>{tier.left}</span>
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            className="lf-link"
            style={{ marginTop: 8 }}
            onClick={() => setTiersModalOpen(true)}
          >
            Edit levels
          </button>
        )}
      </ShellWidget>

      <EditSponsorshipTiersModal
        isOpen={tiersModalOpen}
        onClose={() => setTiersModalOpen(false)}
        initialTiers={sponsorshipTierSeeds}
        onSave={async (tiers) => {
          await saveSponsorshipTiers(tiers);
          await refetchAll();
        }}
      />
    </>
  );
}

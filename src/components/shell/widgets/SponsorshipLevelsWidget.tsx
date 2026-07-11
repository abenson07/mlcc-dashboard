"use client";

import { useState } from "react";
import EditSponsorshipTiersModal from "@/components/sponsorship/EditSponsorshipTiersModal";
import { useLeafletContext } from "@/components/leaflet/LeafletContext";
import ShellWidget from "./ShellWidget";
import SegmentedBar from "./charts/SegmentedBar";
import { IconColorSwatch } from "./widgetIcons";
import WidgetFooterButton from "./WidgetFooterButton";

const TIER_COLORS = ["#337af5", "#3da1a9", "#aa57ef", "#e34053"];

export default function SponsorshipLevelsWidget() {
  const { sponsorshipTiers, sponsorshipTierSeeds, readOnly, saveSponsorshipTiers, refetchAll } =
    useLeafletContext();
  const [tiersModalOpen, setTiersModalOpen] = useState(false);

  const tiersGoal = sponsorshipTiers.reduce((sum, tier) => sum + tier.amount * tier.quantity, 0);
  const tiersCommitted = sponsorshipTiers.reduce(
    (sum, tier) => sum + tier.amount * (tier.quantity - tier.remaining),
    0,
  );

  return (
    <>
      <ShellWidget title="Sponsorships" widgetId="sponsorship-levels">
        <div className="shell-widget-headline-group">
          <div className="shell-widget-headline">${tiersCommitted.toLocaleString()}</div>
          <div className="shell-widget-headline-sub">Goal: ${tiersGoal.toLocaleString()}</div>
        </div>

        <SegmentedBar
          total={tiersGoal}
          groups={sponsorshipTiers.map((tier, index) => {
            const color = TIER_COLORS[index % TIER_COLORS.length];
            const takenCount = tier.quantity - tier.remaining;
            return {
              key: tier.name,
              segments: [
                { value: tier.amount * takenCount, color, opacity: 1 },
                { value: tier.amount * tier.remaining, color, opacity: 0.5 },
              ],
            };
          })}
        />

        <div className="shell-widget-legend shell-widget-legend--2x2">
          {sponsorshipTiers.map((tier, index) => {
            const color = TIER_COLORS[index % TIER_COLORS.length];
            return (
              <div key={tier.name} className="shell-widget-legend-item">
                <IconColorSwatch color={color} />
                <div>
                  <div className="shell-widget-legend-label">{tier.name}</div>
                  <div className="shell-widget-legend-sublabel">{tier.left}</div>
                </div>
              </div>
            );
          })}
        </div>

        {!readOnly && (
          <WidgetFooterButton onClick={() => setTiersModalOpen(true)}>
            Edit sponsorships
          </WidgetFooterButton>
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

"use client";

import QrCodesWidget from "./QrCodesWidget";
import DistributionProgressWidget from "./DistributionProgressWidget";
import DistributionDetailsWidget from "./DistributionDetailsWidget";

export default function LeafletWidgetPanel() {
  return (
    <>
      <QrCodesWidget />
      <DistributionProgressWidget />
      <DistributionDetailsWidget />
    </>
  );
}
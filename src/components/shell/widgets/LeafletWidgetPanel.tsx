"use client";

import QrCodesWidget from "./QrCodesWidget";
import DistributionProgressWidget from "./DistributionProgressWidget";
import CommunicationStagesWidget from "./CommunicationStagesWidget";
import DistributionDetailsWidget from "./DistributionDetailsWidget";
import CoverSheetsWidget from "./CoverSheetsWidget";

export default function LeafletWidgetPanel() {
  return (
    <>
      <QrCodesWidget />
      <DistributionProgressWidget />
      <CommunicationStagesWidget />
      <DistributionDetailsWidget />
      <CoverSheetsWidget />
    </>
  );
}
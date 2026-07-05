import type { ComponentType } from "react";
import CommunicationStagesWidget from "./CommunicationStagesWidget";
import DistributionDetailsWidget from "./DistributionDetailsWidget";
import DistributionProgressWidget from "./DistributionProgressWidget";
import ListsForLeafletWidget from "./ListsForLeafletWidget";
import QrCodesWidget from "./QrCodesWidget";

export type ShellWidgetEntry = {
  id: string;
  title: string;
  Component: ComponentType;
};

/** All shell widget-panel widgets — use for showcase and per-page panel config. */
export const SHELL_WIDGET_CATALOG: ShellWidgetEntry[] = [
  { id: "lists-for-leaflet", title: "Lists for leaflet", Component: ListsForLeafletWidget },
  { id: "qr-codes", title: "QR Codes", Component: QrCodesWidget },
  { id: "distribution-progress", title: "Distribution Progress", Component: DistributionProgressWidget },
  { id: "communication-stages", title: "Communication Stages", Component: CommunicationStagesWidget },
  { id: "distribution-details", title: "Distribution Details", Component: DistributionDetailsWidget },
];

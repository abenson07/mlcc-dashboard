import type { DeliveryWithRelations } from "hooks";
import type { Leaflets, LeafletStatus, LeafletCommSchedule } from "@/types/database";
import { sampleDeliverers } from "@/data/mocks/leaflets";

export type DemoLeafletCommFields = {
  comm_schedule?: LeafletCommSchedule;
  commSent?: Record<string, string>;
};

export function leafletRowForComm(input: {
  id: string;
  title: string;
  distributionDate: string;
  distributionDate2?: string | null;
  status: LeafletStatus;
  comm_schedule?: LeafletCommSchedule;
  commSent?: Record<string, string>;
}): Leaflets {
  const sent = input.commSent ?? {};
  return {
    id: input.id,
    title: input.title,
    distribution_date: input.distributionDate,
    distribution_date_2: input.distributionDate2 ?? null,
    sponsorship_due_date: null,
    delivery_date: null,
    status: input.status,
    activated_at: null,
    closed_at: null,
    print_cost_cents: null,
    sponsorship_goal_cents: null,
    membership_qr_code_id: null,
    open_routes_qr_code_id: null,
    comm_schedule: input.comm_schedule ?? {},
    comm_initial_confirmation_sent_at: sent.initial_confirmation ?? null,
    comm_confirmation_followup_sent_at: sent.confirmation_followup ?? null,
    comm_distribution_day_pickup_sent_at: sent.distribution_day_pickup ?? null,
    comm_delivery_complete_prompt_sent_at: sent.delivery_complete_prompt ?? null,
    created_at: "",
    updated_at: "",
  };
}

export function demoDeliveriesForComm(
  leafletId: string,
  sent: Record<string, string> = {},
): DeliveryWithRelations[] {
  const reminderAt = sent.pre_distribution_reminder ?? null;
  return sampleDeliverers.map((d) => {
    const response =
      d.status === "Confirmed" ? "confirmed" : d.status === "Declined" ? "rejected" : "pending";
    return {
      id: d.id,
      person_id: d.id,
      route_id: d.routes[0]?.routeId ?? d.id,
      date_delivered: null,
      leaflet_id: leafletId,
      leaflet_count: d.routes[0]?.leafletCount ?? null,
      is_skipped: false,
      response,
      responded_at: null,
      leaflets_delivered: null,
      leaflets_leftover: null,
      building_contact_name: null,
      building_contact_email: null,
      building_contact_phone: null,
      building_contact_is_deliverer: false,
      comm_pre_distribution_reminder_sent_at: reminderAt,
      comm_completion_followup_sent_at: null,
      created_at: null,
      updated_at: null,
      people: { id: d.id, email: d.email, full_name: d.name },
    } as DeliveryWithRelations;
  });
}

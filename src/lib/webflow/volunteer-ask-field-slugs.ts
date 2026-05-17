/**
 * Default field slugs for the Webflow "Volunteer Asks" CMS collection.
 * Override with WEBFLOW_VOLUNTEER_ASK_FIELD_* env vars if Designer slugs differ.
 */
export type VolunteerAskFieldSlugs = {
  supabaseAskId: string;
  description: string;
  commitmentType: string;
  commitmentUnit: string;
  commitmentQuantity: string;
  commitmentSummary: string;
  quantityNeeded: string;
  signedUp: string;
  remaining: string;
  eventName: string;
};

export function getVolunteerAskFieldSlugs(): VolunteerAskFieldSlugs {
  return {
    supabaseAskId:
      process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_SUPABASE_ASK_ID ?? "supabase-ask-id",
    description: process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_DESCRIPTION ?? "description",
    commitmentType:
      process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_COMMITMENT_TYPE ?? "commitment-type",
    commitmentUnit:
      process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_COMMITMENT_UNIT ?? "commitment-unit",
    commitmentQuantity:
      process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_COMMITMENT_QUANTITY ?? "commitment-quantity",
    commitmentSummary:
      process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_COMMITMENT_SUMMARY ?? "commitment-summary",
    quantityNeeded:
      process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_QUANTITY_NEEDED ?? "quantity-needed",
    signedUp: process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_SIGNED_UP ?? "signed-up",
    remaining: process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_REMAINING ?? "remaining",
    eventName: process.env.WEBFLOW_VOLUNTEER_ASK_FIELD_EVENT_NAME ?? "event-name",
  };
}

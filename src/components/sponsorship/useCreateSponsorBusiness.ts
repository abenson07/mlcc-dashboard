"use client";

import { useBusinesses, useDemoGuard } from "hooks";
import { newDemoId } from "@/lib/demo/demoStore";

/** Creates a business from an Add sponsor form and returns its id; demo mode saves locally only. */
export function useCreateSponsorBusiness() {
  const { create } = useBusinesses({ autoFetch: false });
  const { enabled: demo, overlay } = useDemoGuard();

  return async function createSponsorBusiness(
    name: string,
    contact: { contactName: string; email: string },
  ): Promise<string> {
    const fields = {
      contact_name: contact.contactName.trim() || null,
      email: contact.email.trim() || null,
    };
    if (demo) {
      const id = newDemoId("biz");
      overlay.upsert("businesses", {
        id,
        business_name: name,
        ...fields,
        is_member: false,
        is_past_sponsor: false,
        sponsorships: [],
        membership: null,
      });
      return id;
    }
    const business = await create({ business_name: name, ...fields });
    if (!business) throw new Error("Couldn't create the business. Please try again.");
    return business.id;
  };
}

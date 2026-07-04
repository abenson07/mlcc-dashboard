import { redirect } from "next/navigation";

export default function EventsHubRedirectPage() {
  redirect("/old-admin/events");
}

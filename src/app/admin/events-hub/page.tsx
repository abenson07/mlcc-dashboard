import { redirect } from "next/navigation";

export default function EventsHubRedirectPage() {
  redirect("/admin/events");
}
